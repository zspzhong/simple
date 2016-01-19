var dao = require('./51offerDao');

exports.planList = planList;
exports.schoolOfPlan = schoolOfPlan;
exports.allPlanCount = allPlanCount;

function planList(req, res, callback) {
    var index = Number(req.query.index || 0);
    var size = Number(req.query.size || 100);
    var sortField = req.query.sort || 'id';
    var sortWay = req.query.way || 'asc';

    dao.queryPlanListWithPageIndexSizeAndSortField(index, size, sortField, sortWay, callback);
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

function allPlanCount(req, res, callback) {
    dao.queryPlanCount(callback);
}