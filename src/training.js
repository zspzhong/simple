var request = require('request');
var iconv = require('iconv-lite');


//var options = {
//    url: 'http://www.apesk.com/Management-potential/index_hr_yf.asp?hr_email=18201123448&test_name=myoffer_test&test_email=panxin.zhu@myoffer.com&host=',
//    headers: {
//        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//        'Accept-Encoding': 'gzip, deflate, sdch',
//        'Accept-Language': 'en-US,en;q=0.8',
//        'Cache-Control': 'no-cache',
//        'Connection': 'keep-alive',
//        'Host': 'www.apesk.com',
//        'Pragma': 'no-cache',
//        'Upgrade-Insecure-Requests': 1,
//        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.15 Safari/537.36'
//    },
//    encoding: null
//};
//
//request.get(options, function (err, res, body) {
//    console.log(iconv.decode(body, 'gb2312'));
//});


var options = {
    url: 'http://www.apesk.com/mensa/common_submit_hr/glqz_submit_conn.asp?shijiancha=2015%2F10%2F10+17%3A04%3A37&host=&liangbiao=Research-potential&hr_email=18201123448&test_name=myoffer_test&test_email=xinsha.deng%40myoffer.com&feishi=116&gangwei=yf&id=&answer1=T&answer2=F&answer3=T&answer4=I&answer5=P&answer6=N&answer7=T&answer8=S&answer9=E&answer10=J&answer11=I&answer12=N&answer13=J&answer14=E&answer15=S&answer16=J&answer17=S&answer18=E&answer19=T&answer20=T&answer21=P&answer22=I&answer23=S&answer24=N&answer25=E&answer26=P&answer27=F&answer28=P&answer29=l0&answer30=l0&answer31=l0&answer32=l0&answer33=l0&answer34=l0&answer35=l0&answer36=l0&answer37=l0&answer38=l0&answer39=l0&answer40=l0&answer2-1=rjgx&answer2-2=mbdx&answer2-3=sfl&answer2-4=zllj&answer2-5=ljnl&answer2-6=ylgl&answer2-7=tzx&answer2-8=tzx&answer2-9=ylgl&answer2-10=qxwd&answer2-11=tdgl&answer2-12=ljnl&answer2-13=jdl&answer2-14=ghap&answer2-15=xznl&answer2-16=rjgx&answer2-17=jdgk&answer2-18=bd&answer2-19=jhap&answer2-20=tlnl&answer2-21=bd&answer2-22=zllj&answer2-23=tdxz&answer2-24=qxwd&answer2-25=synl&answer2-26=kaola&answer2-27=kaola&answer2-28=jsx&answer2-29=synl&answer2-30=xznl&answer2-31=tdxz&answer2-33=jltd&answer2-34=ljnl&answer2-35=ljnl&answer2-36=bd&answer2-37=jsx&answer2-38=synl&answer2-39=ybtk&answer2-40=jdgk',
    headers: {
        'Host': 'www.apesk.com',
        'Content-Length': 1228,
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Origin': 'http://www.apesk.com',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.15 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'http://www.apesk.com/Management-potential/index_hr_yf.asp?hr_email=18201123448&test_name=myoffer_test&test_email=xinsha.deng@myoffer.com&host=',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.8',
        'Cookie': 'ASPSESSIONIDSQSBCCQB=IJCJFEDDIOHNHBJIHFNLKHOB; NumVisits=1; ASPSESSIONIDSSRACCRA=BJGAEAAAGMADEFCLCEKHLAHP; Hm_lvt_f4a3486651139f899f3fd9c74bf3ae6b=1444357605,1444377819,1444378058,1444379002; Hm_lpvt_f4a3486651139f899f3fd9c74bf3ae6b=1444467878HNHBJIHFNLKHOB; NumVisits=1; ASPSESSIONIDSSRACCRA=BJGAEAAAGMADEFCLCEKHLAHP; Hm_lvt_f4a3486651139f899f3fd9c74bf3ae6b=1444357605,1444377819,1444378058,1444379002; Hm_lpvt_f4a3486651139f899f3fd9c74bf3ae6b=1444463158'
    },
    encoding: null
};

request.post(options, function (err, res, body) {
    if (err) {
        console.log(err);
        return;
    }
    
    console.log(iconv.decode(body, 'gb2312'));
});