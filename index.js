var express = require('express');
var crypto = require("crypto");
var app = express();
var xmlparser = require("express-xml-bodyparser");
var xml2js = require("xml2js");
var axios = require("axios");

app.set('port', process.env.PORT || 80);

app.engine(".html", require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static('public'));

function fetchWeather(city, req, res, bWeChat, val) {
	var url = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22${city}%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`;
	axios.get(url).then(function(response) {
		var results = response.data.query.results.channel;
		// var title = results.title;
		var desc = results.description.replace("Yahoo! ", "");
		var ccity = results.location.city;
		var region = results.location.region;
		var country = results.location.country;
		// var output = "title: " + title + "\n";
		// var wind_speed = Number(results.wind.speed * 1.60934).toFixed(1) + " km/h";
		var wind_speed = results.wind.speed + "km/h";
		var wind_direction = results.wind.direction + " degree";
		var tempF = results.item.condition.temp + " " + results.units.temperature;
		var tempC = Number((parseInt(results.item.condition.temp) - 32)* 5 / 9).toFixed(1) + " C";
		var condition = results.item.condition.text;
		var humidity = results.atmosphere.humidity + "%";
		var pressure = results.atmosphere.pressure + " milibars";
		var sunrise = results.astronomy.sunrise;
		var sunset = results.astronomy.sunset;
		var forecast = results.item.forecast || [];
		var output = desc + "\n";
		output += "country: " + country + "\n";
		output += "region: " + region + "\n";
		output += "city: " + ccity + "\n";
		output += "condition: " + condition + "\n";
		output += "temperature: " + tempC + " / " + tempF + "\n";
		output += "wind speed: " + wind_speed + "\n";
		output += "wind direction: " + wind_direction + "\n";
		output += "humidity: " + humidity + "\n";
		output += "pressure: " + pressure + "\n";
		output += "sunrise: " + sunrise + "\n";
		output += "sunset: " + sunset + "\n";
		forecast.forEach((item) => {
			var p_date = item.date;
			var p_day = item.day;
			var p_condition = item.text;
			var p_high = Number((parseInt(item.high) - 32) * 5 / 9).toFixed(1) + "C/" + item.high + "F";
			var p_low = Number((parseInt(item.low) - 32) * 5 / 9).toFixed(1) + "C/" + item.low + "F";
			output += p_date + " " + p_day + " " + p_condition + " " + p_low + " - " + p_high + "\n";
		});
		console.log(output);
		if (bWeChat) {
			var retVal = {
					ToUserName: val.fromUserName,
					FromUserName: val.toUserName,
					CreateTime: val.createTime,
					MsgType: "text",
					Content: output
				};
			var xmlBuilder = new xml2js.Builder({rootName: "xml"});
			var xml = xmlBuilder.buildObject(retVal);
			res.send(xml);
		} else {
			res.send(output);
		}
	}).catch(function(err) {
		console.log(err);
	});
}

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
//get prototype
app.get('/weather', (req, res) => {
	var city = req.query.city;
	fetchWeather(city, req, res);
});

//post msg
app.post('/wx', xmlparser({trim: false, explicityArray: false}), function(req, res) {
	var input = req.body.xml;
	var toUserName = input.tousername;
	var fromUserName = input.fromusername;
	var createTime = input.createtime;
	var msgType = input.msgtype[0];
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
	var retVal = {};
	var xmlBuilder;
	var xml;
	if (msgType === "text") {
		// console.log(content);
		retVal = {
			ToUserName: val.fromUserName,
			FromUserName: val.toUserName,
			CreateTime: val.createTime,
			MsgType: "text",
			Content: "您好, 文本消息已收悉，谢谢"
		};
		var value = content[0];
		if (value.includes("weather")) {
			var inputs = value.split(" ");
			var params = inputs[1];
			fetchWeather(params, req, res, true, val);
		} else {
			// console.log("about to reply");
			xmlBuilder = new xml2js.Builder({rootName: "xml"});
			xml = xmlBuilder.buildObject(retVal);
			console.log(xml);
			res.send(xml);
		}
	} else if (msgType === "image") {
		retVal = {
			ToUserName: val.fromUserName,
			FromUserName: val.toUserName,
			CreateTime: val.createTime,
			MsgType: "text",
			Content: "您好, 图片消息已收悉，谢谢"
		};
		xmlBuilder = new xml2js.Builder({rootName: "xml"});
		xml = xmlBuilder.buildObject(retVal);
		console.log(xml);
		res.send(xml);
	} else if (msgType === "voice") {
		retVal = {
			ToUserName: val.fromUserName,
			FromUserName: val.toUserName,
			CreateTime: val.createTime,
			MsgType: "text",
			Content: "您好, 语音消息已收悉，谢谢"
		};
	} else {
		retVal = {
			ToUserName: val.fromUserName,
			FromUserName: val.toUserName,
			CreateTime: val.createTime,
			MsgType: "text",
			Content: "您好"
		};
		xmlBuilder = new xml2js.Builder({rootName: "xml"});
		xml = xmlBuilder.buildObject(retVal);
		console.log(xml);
		res.send(xml);
	}

    // var xmlBuilder = new xml2js.Builder({rootName: "xml"});
    // var xml = xmlBuilder.buildObject(retVal);
	// console.log(xml);
	// res.send(xml);
});

app.listen(app.get('port'), function(){
	console.log('Express started at port: ' + app.get('port') + ', press Ctrl - C to terminated');
});
