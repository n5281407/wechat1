var express = require('express');
var crypto = require("crypto");
var app = express();
var xmlparser = require("express-xml-bodyparser");
var xml2js = require("xml2js");

app.set('port', process.env.PORT || 80);

app.get('/wx', function(req, res) {
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
		res.send("");
	}
});
//post msg
app.post('/wx', xmlparser({trim: false, explicityArray: false}), function(req, res) {
	var input = req.body.xml;
	var toUserName = input.tousername;
	var fromUserName = input.fromusername;
	var createTime = input.createtime;
	var msgType = input.msgtype;
	var content = input.content;
	var msgId = input.msgid;
	var val = {
		toUserName,
		fromUserName,
		createTime,
		msgType,
		content,
		msgId
	};
    var retVal = {
        ToUserName: val.fromUserName,
        FromUserName: val.toUserName,
        CreateTime: val.createTime,
        MsgType: val.msgType,
        Content: "您好"
    };
    var xmlBuilder = new xml2js.Builder({rootName: "xml"});
    var xml = xmlBuilder.buildObject(retVal);
	console.log(xml);
	res.send(xml);
});

app.listen(app.get('port'), function(){
	console.log('Express started at port: ' + app.get('port') + ', press Ctrl - C to terminated');
});
