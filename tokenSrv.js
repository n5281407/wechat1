var express = require('express');
var app = express();
var request = require("request");
var postUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx5e1068381abcf3bc&secret=10e3e710e4c30efbe64260ec74f192d1";

var token = "";

var updateToken = function() {
    request.get(postUrl, (err, res, body) => {
        if (!err) {
            token = JSON.parse(body).access_token;
            console.log("token updated with: " + token);
        }
    });
};

updateToken();

setInterval(function(){
    updateToken();
}, 5400000);

app.set('port', process.env.PORT || 8001);

app.get('/token', function(req, res) {
    var obj = {
        access_token: token
    };
    res.json(obj);
});

app.listen(app.get('port'), function(){
	console.log('token service started at port: ' + app.get('port') + ', press Ctrl - C to terminated');
});