var request = require('request');

var menuObj = {
    button: [
        {
            type: "click",
            name: "指令集",
            key: "m_commands"
        },
        {
            name: "关于我",
            type: "media_id",
            media_id: ""
        }
    ]
};


var obj =  {
    "button":[
        {    
            "type":"click",
            "name":"指令集",
            "key":"V1001_COMMAND"
        },
        {
            "name":"关于",
            "sub_button":[
            {    
                "type":"view",
                "name":"搜索",
                "url":"http://www.soso.com/"
            },
            {
                "type":"click",
                "name":"关于我们",
                "key":"V1001_US"
            }]
        }
    ]
};

var createMenu = function() {
    console.log("invoking createMenu...");
    request("http://localhost:8001/token", function(err, res, body){
        if (!err) {
            var token = JSON.parse(body).access_token;
            console.log("token service returned with token: " + token);
            var postUrl = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + token;
            var options = {
                uri: postUrl,
                method: "POST",
                json: obj
            };
            request(options, function(err, res, body) {
                // console.log(err);
                // console.log(res);
                console.log(body);
            });            
        }
    });
    // var token = tokenManager.token;
    // console.log("access token is: " + token);

};

var deleteMenu = function() {
    console.log("invoking delete menu...");
    request("http://localhost:8001/token", function(err, res, body){
        if (!err) {
            var token = JSON.parse(body).access_token;
            console.log("token service returned with token: " + token);
            var postUrl = "https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=" + token;
            request.get(postUrl, (err, res, body) => {
                if (!err) {
                    console.log("delete menu ok");
                }
            });
        }
    });    
};

createMenu();
// deleteMenu();