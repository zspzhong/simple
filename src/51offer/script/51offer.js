var http = require('http');
var request = require('request').defaults({
    agent: new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 2000,
        maxSockets: 1000
    })
});

var cheerio = require('cheerio');
var crypto = require('crypto');
var uuid = require('uuid');
var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');

exports.run = run;

var country2Code = {
    '英国': '44',
    '澳洲': '61',
    '新西兰': '64',
    '新加坡': '65',
    '日本': '81'
};
var code2Country = {};
_.each(country2Code, function (value, key) {
    code2Country[value] = key;
});

var grade2Code = {
    '硕士毕业已工作': '22',
    '硕士在读': '17',
    '本科毕业已工作': '12',
    '本科大四': '10',
    '本科大三': '9',
    '本科大二': '8',
    '本科大一': '7',
    '大专毕业三年及以上': '21',
    '大专毕业三年以下': '16',
    '大专大三': '15',
    '大专大二': '14',
    '大专大一': '13',
    '高三毕业已工作': '11',
    '高三': '6',
    '高二': '5',
    '高一': '4',
    '初三': '3',
    '初二': '2',
    '初一': '1'
};
var code2Grade = {};
_.each(grade2Code, function (value, key) {
    code2Grade[value] = key;
});

var major2Sub = {
    '商科': ['不限', '体育科学', '创新研究', '商科', '图书馆和信息管理', '土地及物业管理', '酒店，休闲，娱乐和旅游'],
    '医药学': ['不限', '兽医', '医学', '医学和相关学', '影像学', '心理学', '护理', '牙科', '物理治疗学', '药物学和药剂', '解剖与生理学'],
    '社会科学': ['不限', '东亚和南亚研究', '中东和非洲研究', '人类学', '伊比利亚语', '会计与金融', '俄罗斯和东欧语言', '凯尔特研究', '历史', '哲学', '德语', '意大利语', '政治', '政治与国际研究', '教育', '教育学', '法律', '法语', '社会学', '社会工作', '社会政策', '神学和宗教研究', '经典和古代历史', '经济学和计量经济学', '统计学与运筹学', '美国研究', '考古学', '英语', '语言学', '通信与传媒研究', '通信及传媒研究', '音乐'],
    '工科': ['不限', '一般工程', '化学工程', '土木工程', '建造学', '机械工程', '材料技术', '电气及电子工程', '航空和制造工程学', '计算机科学'],
    '艺术': ['不限', 'Art and Design', '城镇和农村的规划和设计', '建筑与设计学', '建筑学', '戏剧和舞蹈', '艺术'],
    '自然科学': ['不限', '农业与林业学', '化学', '地球和海洋科学', '地理和区域研究', '地理和环境科学', '地质学', '数学', '材料科学', '物理与天文学', '物理和天文', '环境科学', '生物科学', '纺织品科学', '营养学'],
    '经济金融': ['不限', '会计和金融', '经济学']
};

var UPDATE_INTENTION_URL = 'http://www.51offer.com/threeSteps/updateOneStep.do';
var DEGREE_PAGE_URL = 'http://www.51offer.com/threeSteps/updateTwoStep.do';
var UPDATE_DEGREE_URL = 'http://www.51offer.com/threeSteps/updateUserStudy.do';
var UPDATE_BASE_INFO_URL = 'http://www.51offer.com/threeSteps/addDcApplys.do';
var CATEGORY_URL = 'http://www.51offer.com/chooseApi/autoApi.do?&url=/pick/plans';
var UNIVERSITY_LIST_URL = 'http://www.51offer.com/chooseApi/autoApi.do?query=&template_id={template_id}&country_id={country_id}&sort={sort}&category_id={category_id}&page={page}&url=/pick/schools';

var COOKIE = 'aliyungf_tc=AQAAAGFTcVqpCwsAwo0Rt/UxWhuRcS8F; visitId=8a2c2e305119dc52015119fa91a41318; bdshare_firstime=1448852600108; CNZZDATA1255230918=682124449-1448849339-null%7C1448849339; pinggudiv=1; is_show_email=0; _bi_cid=f9579e60a689cbc0c10c77c4d31d6; _bi_vid=00f1fcd39c407ff351c8c087d5217; cookieId=823c859bdcc6ef5022d279482164a87d; _gat=1; islogin=1; username=offer1129247; salt=9d9b4afc-6da4-444a-8c18-f4126902eedd; uid=1129247; referer=http%3A%2F%2Faccount.51offer.com%2FuserLogin.html; JSESSIONID=4D71B61C64496BE10F9EC37308E1381A; type=; src=; source_uid=; service_uid=; nTalk_CACHE_DATA={uid:kf_9600_ISME9754_1129247,tid:1452477055152870}; NTKF_T2D_CLIENTID=guest90581195-2745-9ADC-464A-19FA93BA76CB; _ga=GA1.2.605144285.1447839638; Hm_lvt_2d817197f98b64841ffa5cf9d56d54dd=1452132126,1452134640; Hm_lpvt_2d817197f98b64841ffa5cf9d56d54dd=1452477095';

function run() {
    var stateList = _buildStateList();

    async.series([_filterExistsState, _startSpider], function (err) {
        if (err) {
            console.log(err);
            return;
        }

        console.log('spider done.');
        process.exit(0);
    });

    function _buildStateList() {
        var stateList = [];

        var countryOption = ['英国', '澳洲'];
        var gradeOption = ['本科大四', '本科毕业已工作', '大专大三', '大专毕业三年以下', '高三'];
        var majorOption = _.keys(major2Sub);

        var defaultState = {
            intention: {
                hope_in_country: country2Code['英国'],
                hope_in_year: '2016',
                current_grade: grade2Code['本科大四'],
                region: '0086',
                mobile: '18565663420'
            },
            degree: {},
            baseInfo: {
                userName: 'Sha',
                school: '武汉大学',
                grade_in_major: '经济金融',
                gpa: '80',
                hope_in_major1: '经济金融',
                hope_in_major2: '不限',
                language_key: '雅思',
                language_value: '8'
            }
        };

        _.each(countryOption, function (country) {
            var one = _.assign({}, defaultState);

            _.assign(one.intention, {hope_in_country: country2Code[country]});
            _.each(gradeOption, function (grade) {
                _.assign(one.intention, {current_grade: grade2Code[grade]});
                _.each(majorOption, function (major) {
                    _.assign(one.baseInfo, {grade_in_major: major, hope_in_major1: major});
                    stateList.push(_.cloneDeep(one));
                });
            });
        });

        _.map(stateList, function (item) {
            var stateBuffer = new Buffer(JSON.stringify(item));
            item.id = crypto.createHash('md5').update(stateBuffer).digest('hex');
        });

        return stateList;
    }

    function _filterExistsState(callback) {
        dataUtils.query('sa_plan', {}, ['id'], function (err, result) {
            if (err) {
                callback(err);
                return;
            }


            var existsPlanIdList = _.pluck(result, 'id');
            stateList = _.filter(stateList, function (item) {
                return !_.contains(existsPlanIdList, item.id);
            });
            callback(null);
        });
    }

    function _startSpider(callback) {
        async.eachLimit(stateList, 1, spiderByOneState, callback);
    }
}

function spiderByOneState(state, callback) {
    var schoolCateList = [];
    var schoolList = [];

    async.series([_updateIntention, _updateDegree, _updateBaseInfo, _getRecommend, _transAndSave], function (err) {
        if (err) {
            console.log(err);
        }

        console.log('spider one success.');
        callback(null);
    });

    // 更改意向
    function _updateIntention(callback) {
        var option = {
            url: UPDATE_INTENTION_URL,
            headers: {
                Cookie: COOKIE
            },
            form: state.intention
        };

        request.post(option, function (err, res, body) {
            if (err) {
                callback(err);
                return;
            }

            if (res.statusCode == 200 && body == 1) {
                callback(null);
                return;
            }

            callback('调用失败');
        });
    }

    // 更改学位
    function _updateDegree(callback) {
        var degreeOption = {
            country: state.intention.hope_in_country,
            course: '',
            title: ''
        };

        async.series([_getDegreeOption, _update], callback);

        function _getDegreeOption(callback) {
            var option = {
                url: DEGREE_PAGE_URL,
                headers: {
                    Cookie: COOKIE
                }
            };

            request.get(option, function (err, res, body) {
                if (err) {
                    callback(err);
                    return;
                }

                if (res.statusCode !== 200) {
                    callback('request error: ' + DEGREE_PAGE_URL);
                    return;
                }

                var degreeCourseList = _parseDegreeCourseFromHtml(body);
                degreeOption.course = degreeCourseList.join(',');

                var degreeTitleList = _parseDegreeTitleFromHtml(body);
                degreeOption.title = degreeTitleList.join('|');

                state.degree = degreeOption;
                callback(null);
            });
        }

        function _update(callback) {
            var option = {
                url: UPDATE_DEGREE_URL,
                headers: {
                    Cookie: COOKIE
                },
                form: degreeOption
            };

            request.post(option, function (err, res, body) {
                if (err) {
                    callback(err);
                    return;
                }

                if (res.statusCode != 200 && body != 1) {
                    callback('request error: ' + UPDATE_DEGREE_URL);
                    return;
                }

                callback(null);
            });
        }

        function _parseDegreeCourseFromHtml(html) {
            var courseList = [];
            var $ = cheerio.load(html);
            var degreeNodeList = $('.study-mod .input-control.checkbox span');

            _.each(degreeNodeList, function (item) {
                courseList.push($(item).attr('data-val'));
            });

            return courseList;
        }

        function _parseDegreeTitleFromHtml(html) {
            var titleList = [];
            var $ = cheerio.load(html);
            var degreeNodeList = $('.study-mod .input-control.checkbox span b');

            _.each(degreeNodeList, function (item) {
                titleList.push(_.trim($(item).text()));
            });

            return titleList;
        }
    }

    // 更改个人基本信息
    function _updateBaseInfo(callback) {
        var option = {
            url: UPDATE_BASE_INFO_URL,
            headers: {
                Cookie: COOKIE
            },
            form: state.baseInfo
        };

        request.post(option, function (err, res, body) {
            if (err) {
                callback(err);
                return;
            }

            if (res.statusCode != 200 || body != 200) {
                callback('request error: ' + UPDATE_BASE_INFO_URL);
                return;
            }

            callback(null);
        });
    }

    function _getRecommend(callback) {
        async.series([_getCategory, _getSchoolList], callback);

        // 类别
        function _getCategory(callback) {
            var option = {
                url: CATEGORY_URL,
                headers: {
                    Cookie: COOKIE
                }
            };

            request.get(option, function (err, res, body) {
                if (err) {
                    callback(err);
                    return;
                }

                if (res.statusCode != 200) {
                    callback('request error: ' + CATEGORY_URL);
                    return;
                }

                schoolCateList = JSON.parse(body).data;
                callback(null);
            });
        }

        // 获取具体的推荐列表
        function _getSchoolList(callback) {
            var allCondition = buildAllCondition();

            async.eachLimit(allCondition, 10, _queryByOneCondition, callback);

            function _queryByOneCondition(condition, callback) {
                var option = {
                    url: replaceUrlArgs(UNIVERSITY_LIST_URL, condition),
                    headers: {
                        Cookie: COOKIE
                    }
                };

                request.get(option, function (err, res, body) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    if (res.statusCode != 200) {
                        callback('request error: ' + UNIVERSITY_LIST_URL);
                        return;
                    }

                    var data = JSON.parse(body).data;

                    _.each(data, function (item) {
                        schoolList.push({
                            cname: item.cname,
                            ename: item.ename,
                            templateId: condition.template_id,
                            templateName: condition.template_name,
                            categoryId: condition.category_id
                        });
                    });

                    callback(null);
                });
            }

            function buildAllCondition() {
                var pageSize = 30;
                var condition = [];

                _.each(schoolCateList, function (item) {
                    _.each(item.category_list, function (one) {
                        var pageCount = Math.ceil(one.school_count / pageSize);
                        _.times(pageCount, function (index) {
                            condition.push({
                                template_id: item.template_id,
                                template_name: item.template_name,
                                country_id: item.country_id,
                                sort: one.default_sort,
                                category_id: one.category_id,
                                category_name: one.category_name,
                                page: index + 1
                            });
                        });
                    });
                });

                return condition;
            }
        }
    }

    // 转换并存储
    function _transAndSave(callback) {
        var plan = {};

        var cateId2UId = {};
        _.each(schoolCateList, function (item) {
            _.each(item.category_list, function (one) {
                cateId2UId[item.template_id + '-' + one.category_id] = uuid.v1();
            });
        });

        // 暂时没考虑事物一致性
        async.series([_savePlan, _saveRecommendCate, _saveSchool], callback);

        function _savePlan(callback) {
            _.assign(plan, {
                id: state.id,
                hope_in_country: code2Country[state.intention.hope_in_country],
                hope_in_year: state.intention.hope_in_year,
                current_grade: code2Grade[state.intention.current_grade],
                degree_course: state.degree.course,
                degree_title: state.degree.title,
                grade_in_school: state.baseInfo.school,
                grade_in_major: state.baseInfo.grade_in_major,
                grade_gpa: state.baseInfo.gpa,
                hope_in_major: state.baseInfo.hope_in_major1,
                hope_in_major_sub: state.baseInfo.hope_in_major2,
                language_key: state.baseInfo.language_key,
                language_value: state.baseInfo.language_value
            });

            dataUtils.obj2DB('sa_plan', plan, callback);
        }

        function _saveRecommendCate(callback) {
            var cateList = [];

            _.each(schoolCateList, function (item) {
                _.each(item.category_list, function (one) {
                    cateList.push({
                        id: cateId2UId[item.template_id + '-' + one.category_id],
                        plan_id: plan.id,
                        name: one.category_name,
                        school_count: one.school_count
                    });
                });
            });

            dataUtils.list2DB('sa_recommend_cate', cateList, callback);
        }

        function _saveSchool(callback) {
            var recommendSchoolList = [];

            _.each(schoolList, function (item) {
                var copy = {};

                copy.id = uuid.v1();
                copy.plan_id = plan.id;
                copy.cate_id = cateId2UId[item.templateId + '-' + item.categoryId];
                copy.c_name = item.cname;
                copy.e_name = item.ename;
                copy.degree_name = item.templateName;

                recommendSchoolList.push(copy);
            });

            dataUtils.list2DB('sa_recommend_school', recommendSchoolList, callback);
        }
    }

    // 替换URl参数
    function replaceUrlArgs(url, args) {
        var result = url;

        _.each(args, function (value, key) {
            result = result.replace(new RegExp('\{' + key + '\}', 'g'), value);
        });

        return result;
    }
}