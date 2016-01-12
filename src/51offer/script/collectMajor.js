var request = require('request');

exports.run = run;

function run() {
    var major2Sub = {};
    var majorList = ['工科', '经济金融', '商科', '社会科学', '医药学', '艺术', '自然科学'];

    async.each(majorList, _collectOne, function (err) {
        if (err) {
            console.log(err);
            return;
        }

        console.log(JSON.stringify(major2Sub));
        console.log('success');
    });

    function _collectOne(item, callback) {
        var option = {
            url: 'http://www.51offer.com/threeSteps/rankByParam.do',
            headers: {
                Cookie: 'aliyungf_tc=AQAAAGFTcVqpCwsAwo0Rt/UxWhuRcS8F; visitId=8a2c2e305119dc52015119fa91a41318; bdshare_firstime=1448852600108; CNZZDATA1255230918=682124449-1448849339-null%7C1448849339; pinggudiv=1; is_show_email=0; _bi_cid=f9579e60a689cbc0c10c77c4d31d6; _bi_vid=00f1fcd39c407ff351c8c087d5217; cookieId=823c859bdcc6ef5022d279482164a87d; _gat=1; islogin=1; username=offer1129247; salt=9d9b4afc-6da4-444a-8c18-f4126902eedd; uid=1129247; referer=http%3A%2F%2Faccount.51offer.com%2FuserLogin.html; JSESSIONID=4D71B61C64496BE10F9EC37308E1381A; type=; src=; source_uid=; service_uid=; nTalk_CACHE_DATA={uid:kf_9600_ISME9754_1129247,tid:1452477055152870}; NTKF_T2D_CLIENTID=guest90581195-2745-9ADC-464A-19FA93BA76CB; _ga=GA1.2.605144285.1447839638; Hm_lvt_2d817197f98b64841ffa5cf9d56d54dd=1452132126,1452134640; Hm_lpvt_2d817197f98b64841ffa5cf9d56d54dd=1452477095'
            },
            form: {
                direction: item,
                hopeCountry: '$(hopeCountry)'
            }
        };

        request.post(option, function (err, res, body) {
            if (err) {
                callback(err);
                return;
            }

            if (res.statusCode !== 200) {
                callback('request error');
                return;
            }

            var data = JSON.parse(body);

            major2Sub[item] = _.pluck(data, 'type');
            callback(null);
        });
    }
}