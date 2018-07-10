var request = require('request');

var menuObj = {
    button: [
        {
            type: "click",
            name: "指令集",
            key: "m_commands"
        },
        {
            name: "读PO文",
            sub_button: [
                {
                    type: "view",
                    name: "高贵林",
                    url: ""
                },
                {
                    type: "view",
                    name: "三联市",
                    url: ""
                },
                {
                    type: "view",
                    name: "温哥华",
                    url: ""
                }
            ]
        },
        {
            name: "关于我",
            type: "media_id",
            media_id: ""
        }
    ]
};

var createMenu = function() {
    console.log("invoking createMenu...");
    request("http://localhost:8001/token", function(err, res, body){
        var token = JSON.parse(body).access_token;
        var postUrl = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + token;
        var options = {
            uri: postUrl,
            method: "POST",
            json: JSON.stringify(menuObj)
        };
        request(options, function(err, res, body) {
            // console.log(err);
            // console.log(res);
            // console.log(body);
        });
    });
    // var token = tokenManager.token;
    // console.log("access token is: " + token);

};

// var deleteMenu = function() {
//     var token = tokenManager.getToken();
//     var postUrl = "https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=" + token;
//     request.get(postUrl, (err, res, body) => {
//         if (!err) {
//             token = JSON.parse(body).access_token;
//             console.log("token updated with: " + token);
//         }
//     });    
// };

createMenu();
// deleteMenu();