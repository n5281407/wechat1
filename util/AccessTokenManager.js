var request = require("request");
var token = "";
var appid = "wx0b0a02c65d81e00a";
var secret = "787c322980d3510d39e97281eced12af";
var postUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appid + "&secret=" + secret;
//var postUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx0b0a02c65d81e00a&secret=787c322980d3510d39e97281eced12af";

var updateToken = function() {
    request.get(postUrl, (err, res, body) => {
        if (!err) {
            token = JSON.parse(body).access_token;
			console.log("token updated with: " + token);
        }
    });
};

var getToken = function() {
    return token;
};

var start = function() {
    setInterval(() => {
        updateToken();
    }, 5400000);
};

exports.getToken = getToken;
exports.start = function() {
	setInterval(function( {
		updateToken();
   }, 5400000 );
};
// function getToken() {
//     return token;
// }

// function start() {
//     setInterval(() => {

//     }, 5400000);
// }

