var request = require("request");
var token = "";
var postUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx0b0a02c65d81e00a&secret=787c322980d3510d39e97281eced12af";

var updateToken = function() {
    request.get(postUrl, (err, res, body) => {
        // console.log('err is: ' + err);
        // console.log('res is: ' + res);
        // console.log('body is: ' + body);
        if (!err) {
            token = JSON.parse(body).access_token;
            console.log("token updated with: " + token);
        }
    });
};

// exports.token = token;

exports.getToken = function() {
    console.log("invoking getToken...");
    console.log("returning token as: " + token);
    return token;
};
exports.start = function() {
    console.log('invoking start...');
    updateToken();
    setInterval(function() {
        console.log("requesting token...");
        updateToken();
    }, 5400000);
};

