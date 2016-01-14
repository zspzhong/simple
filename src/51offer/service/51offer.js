var dao = require('./51offerDao');

exports.planList = planList;
exports.schoolOfPlan = schoolOfPlan;

function planList(req, res, callback) {
    dao.queryAllPlanList(callback);
}

function schoolOfPlan(req, res, callback) {
    var planId = req.params.planId;

    dao.querySchoolByPlanId(planId, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        var cateId2SchoolList = _.groupBy(result, 'cate_id');
        var cateList = [];

        _.each(cateId2SchoolList, function (group, cateId) {
            cateList.push({
                cateId: cateId,
                cateName: group[0].cateName,
                degreeName: group[0].degree_name,
                count: group.length
            });
        });

        callback(null, {
            planId: planId,
            cateId2SchoolList: cateId2SchoolList,
            cateList: cateList
        });
    });
}