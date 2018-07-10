var request = require("request");
this.token = "";
var postUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx0b0a02c65d81e00a&secret=787c322980d3510d39e97281eced12af";

var updateToken = function() {
    var that = this;
    request.get(postUrl, (err, res, body) => {
        // console.log('err is: ' + err);
        // console.log('res is: ' + res);
        // console.log('body is: ' + body);
        if (!err) {
            that.token = JSON.parse(body).access_token;
            console.log("token updated with: " + that.token);
        }
    });
};

exports.getToken = function() {
    console.log("invoking getToken...");
    return this.token;
};
exports.start = function() {
    console.log('invoking start...');
    updateToken();
    setInterval(function() {
        console.log("requesting token...");
        updateToken();
    }, 5400000);
};

