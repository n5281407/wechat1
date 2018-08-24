var express = require('express');
var crypto = require("crypto");
var app = express();
var xmlparser = require("express-xml-bodyparser");
var xml2js = require("xml2js");
var axios = require("axios");

var jokeCache = [];

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
        if (bWeChat) {
            var retVal = {
                    ToUserName: val.fromUserName,
                    FromUserName: val.toUserName,
                    CreateTime: val.createTime,
                    MsgType: "text",
                    Content: "Internal Error - 40003"
                };
            var xmlBuilder = new xml2js.Builder({rootName: "xml"});
            var xml = xmlBuilder.buildObject(retVal);
            res.send(xml);
        } else {
            res.send("Internal Error - 40003");
        }
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
// function fetchJoke(req, res, bWeChat, val) {
//     var url = "http://www.chong4.net";
//     axios.get(url).then((response) => {
//         var html = response.data;
//         var contentStart = html.indexOf(`<div id="content">`);
//         var contentEnd = html.indexOf(`</div>`, contentStart);
//         var content = html.substring(contentStart + 18, contentEnd);
//         content = content.replace(/<p>/g, "");
//         content = content.replace(/<\/p>/g, "");
//         content = content.replace(/<br \/>/g, "\n");
//         content = content.replace(/&nbsp/g, " ");
//         content = iconv.decode(content, "gb18030");
//         console.log(content);
//         if (bWeChat) {
//             var retVal = {
//                     ToUserName: val.fromUserName,
//                     FromUserName: val.toUserName,
//                     CreateTime: val.createTime,
//                     MsgType: "text",
//                     Content: content
//                 };
//             var xmlBuilder = new xml2js.Builder({rootName: "xml"});
//             var xml = xmlBuilder.buildObject(retVal);
//             res.send(xml);
//         } else {
//             res.send(content);
//         }
//     }).catch((err) => {
//         console.log(err);
//     });
// }
function fetchHelp(req, res, bWechat, val) {
    var retVal = {
        ToUserName: val.fromUserName,
        FromUserName: val.toUserName,
        CreateTime: val.createTime,
        MsgType: "news",
        ArticleCount: 3,
        Articles: {
            item: [
                {
                    Title: "Help",
                    Description: "Command examples for weather and joke"
                },
                {
                    Title: "weather vancouver\nweather vancouver,bc\nweather vancouver,bc,ca"
                },
                {
                    Title: "joke"
                }
            ]
        }
    };
    var xmlBuilder = new xml2js.Builder({rootName: "xml"});
    var xml = xmlBuilder.buildObject(retVal);
    console.log(xml);
    res.send(xml);
}
function fetchJoke2(req, res, bWechat, val) {
    var url = "https://bird.ioliu.cn/joke/rand?type=text";
    axios.get(url).then((response) => {
        var arr = response.data.data || [];
        if (arr.length > 0) {
            var content = arr[0].content;
            content = content.replace(/&nbsp;/g, "");
            content = content.replace(/ /g, "");
            if (bWechat) {
                replyWeChat(content, val, res);
            } else {
                res.send(content);
            }
            jokeCache.push(content);
        } else {
            if (jokeCache.length > 0) {
                var index = Math.floor(Math.random() * jokeCache.length);
                var joke = jokeCache[index];
                if (bWechat) {
                    replyWeChat(joke, val, res);
                } else {
                    res.send(joke);
                }
            } else {
                if (bWechat) {
                    replyWeChat("Internal Error - 40001", val, res);
                } else {
                    res.send("Internal Error - 40001");
                }
            }
        }
        for (var i = 1; i < arr.length; i++) {
            var next = arr[i].content;
            next = next.replace(/&nbsp;/g, "");
            next = next.replace(/ /g, "");
            jokeCache.push(next);
        }
        console.log("cache size: " + jokeCache.length);
    }).catch((err) => {
        console.log("cache size: " + jokeCache.length);
        if (jokeCache.length > 0) {
            var index = Math.floor(Math.random() * jokeCache.length);
            var joke = jokeCache[index];
            if (bWechat) {
                replyWeChat(joke, val, res);
            } else {
                res.send(joke);
            }
        } else {
            if (bWechat) {
                replyWeChat("Internal Error - 40002", val, res);
            } else {
                res.send("Internal Error - 40002");
            }
        }
        console.log(err);
    });
}

function replyWeChat (msg, val, res) {
    var retVal = {
        ToUserName: val.fromUserName,
        FromUserName: val.toUserName,
        CreateTime: val.createTime,
        MsgType: "text",
        Content: msg
    };
    var xmlBuilder = new xml2js.Builder({rootName: "xml"});
    var xml = xmlBuilder.buildObject(retVal);
    res.send(xml);
}

//get prototype
app.get('/weather', (req, res) => {
    var city = req.query.city;
    fetchWeather(city, req, res);
});
app.get('/joke', (req, res) => {
    fetchJoke2(req, res);
});
app.get('/help', (req, res) => {
    fetchHelp(req, res);
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
        if (value.toLowerCase().includes("weather")) {
            var inputs = value.split(" ");
            var params = inputs[1];
            fetchWeather(params, req, res, true, val);
        } else if (value.toLowerCase().includes("joke")) {
            fetchJoke2(req, res, true, val);
        } else if (value.toLowerCase().includes("help")) {
            fetchHelp(req, res, true, val);
        }
        else {
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
