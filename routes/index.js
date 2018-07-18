var express = require('express');
var router = express.Router();
var config = require('config');
var request = require('request');
/* GET home page. */
router.get('/', function(req, res, next) {
  
  if(!req.session.token){
    var error = req.session.error;
    req.session.error = null;
    res.render('index', { title: 'Express', error:error});
  }else{
    res.redirect('/sales');
  }
});

router.post('/login',function(req,res,next){
  var data = req.body;
  var postData = {
    "grant_type":config.Oauth.grant_type,
    "client_id" :config.Oauth.client_id,
    "client_secret" : config.Oauth.client_secret,
    "username"  : data.username,
    "password"  : data.password
  };

 request.post(
    config.Local_URL+config.Endpoint.Login,
    {json : postData},
    function(err, response, body){
      if(body.error){
        req.session.error = body.error;
        res.redirect('/');
      }else{
        req.session.token = body.access_token;
        res.redirect('/sales');
      }
      res.send();
    });
  
})

module.exports = router;
