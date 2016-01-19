var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');

exports.queryPlanListWithPageIndexSizeAndSortField = queryPlanListWithPageIndexSizeAndSortField;
exports.querySchoolByPlanId = querySchoolByPlanId;

function queryPlanListWithPageIndexSizeAndSortField(index, size, sortField, sortWay, callback) {
    var planList = [];

    async.series([_queryPlan, _queryCate], function (err) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, planList);
    });

    function _queryPlan(callback) {
        var sql = 'select * from sa_plan' +
            ' order by ' + (sortField || 'id') +
            ' ' + sortWay +
            ' limit :start, :size;';

        var value = {
            start: index * size,
            size: size
        };

        dataUtils.execSql(sql, value, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            planList = result;
            callback(null);
        });
    }

    function _queryCate(callback) {
        dataUtils.query('sa_recommend_cate', {}, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            var planId2CateCount = {};
            _.each(result, function (item) {
                var cateCount = planId2CateCount[item.plan_id] = planId2CateCount[item.plan_id] || {};

                if (_.isUndefined(cateCount[item.name])) {
                    cateCount[item.name] = item.school_count;
                    return;
                }

                cateCount[item.name] += item.school_count;
            });

            _.each(planList, function (item) {
                if (_.isEmpty(planId2CateCount[item.id])) {
                    return;
                }

                item.cateCount = planId2CateCount[item.id];
            });

            callback(null);
        });
    }
}

function querySchoolByPlanId(planId, callback) {
    var sql = 'select a.id, a.cate_id, a.c_name, a.e_name, a.degree_name, b.name as cateName' +
        ' from sa_recommend_school a left join sa_recommend_cate b on a.cate_id = b.id' +
        ' where a.plan_id = :planId;';

    dataUtils.execSql(sql, {planId: planId}, callback);
}