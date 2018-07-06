var express = require('express');
var sha1 = require("sha1");
var crypto = require("crypto");
var bodyParser = require('body-parser');
var app = express();

app.set('port', process.env.PORT || 80);

app.get('/wx', function(req, res) {
	var output = 'Once upon a time...';
	var signature = req.query.signature;
	var timestamp = req.query.timestamp;
	var nonce = req.query.nonce;
	var echostr = req.query.echostr;
	var token = "mywechat";
	var arr = [token, timestamp, nonce];
	var str = arr.sort().join("");
    var sig = crypto.createHash("sha1").update(str).digest("hex");
	//console.log(arr);
    if (sig === signature) {
		res.send(echostr);
	} else {
		res.json(data);
	}
});

app.listen(app.get('port'), function(){
	console.log('Express started at port: ' + app.get('port') + ', press Ctrl - C to terminated');
});
