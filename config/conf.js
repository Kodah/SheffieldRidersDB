var jwt = require('jsonwebtoken');

var config = {};

config.JWTSECRET = "AA:Frameworks:)";

config.filterRoutes = function(req) 
{
    if (req.method === 'GET' || 
        req.path === '/register' ||
        req.path === '/authentication') 
    {
    	console.log("Allowed");
        return true;
    }
    return false;
}

config.getUserToken = function (token) {
    var decoded = jwt.verify(token.split(" ")[1], config.JWTSECRET);
    return decoded.username;
}

module.exports = config;