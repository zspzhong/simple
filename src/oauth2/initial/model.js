var dataUtils = require(global['libDir'] + '/dao/dataUtils.js');
var authorizedClientIds = ['simple'];

exports.getAccessToken = getAccessToken;
exports.getClient = getClient;
exports.getRefreshToken = getRefreshToken;
exports.grantTypeAllowed = grantTypeAllowed;
exports.saveAccessToken = saveAccessToken;
exports.saveRefreshToken = saveRefreshToken;
exports.getUser = getUser;

function getAccessToken(bearerToken, callback) {
    dataUtils.query('oauth_access_tokens', {access_token: bearerToken}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (_.isEmpty(result)) {
            callback('wrong bearer token.');
            return;
        }

        var token = result[0];
        callback(null, {
            accessToken: token.access_token,
            clientId: token.client_id,
            expires: token.expires,
            userId: token.userId
        });
    });
}

function getClient(clientId, clientSecret, callback) {
    dataUtils.query('oauth_clients', {client_id: clientId}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (_.isEmpty(result)) {
            callback('wrong client id.');
            return;
        }

        var client = result[0];
        if (clientSecret !== null && client.client_secret !== clientSecret) {
            callback();
            return;
        }

        callback(null, {
            clientId: client.client_id,
            clientSecret: client.client_secret
        });
    });
}

function getRefreshToken(bearerToken, callback) {
    dataUtils.query('oauth_refresh_tokens', {refresh_token: bearerToken}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, _.isEmpty(result) ? false : result[0]);
    });
}

function grantTypeAllowed(clientId, grantType, callback) {
    if (grantType === 'password') {
        return callback(false, authorizedClientIds.indexOf(clientId.toLowerCase()) >= 0);
    }

    callback(false, true);
}

function saveAccessToken(accessToken, clientId, expires, userId, callback) {
    var model = {
        access_token: accessToken,
        client_id: clientId,
        user_id: userId,
        expires: expires
    };

    dataUtils.obj2DB('oauth_access_tokens', model, callback);
}

function saveRefreshToken(refreshToken, clientId, expires, userId, callback) {
    var model = {
        refresh_token: refreshToken,
        client_id: clientId,
        expires: expires,
        user_id: userId
    };

    dataUtils.obj2DB('oauth_refresh_tokens', model, callback);
}

/*
 * Required to support password grant type
 */
function getUser(username, password, callback) {
    dataUtils.query('user', {username: username, password: password}, ['id'], function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, _.isEmpty(result) ? false : result[0]);
    });
}
