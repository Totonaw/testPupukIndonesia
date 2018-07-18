var express = require('express');
var router = express.Router();
var config = require('config');
var request = require('request');

router.use(function(req,res,next){
    if(!req.session.token){
        res.redirect('/');
    }else{
        next();
    }
        
})

router.get('/',function(req,res,next){
    request.get(
        config.Local_URL+config.Endpoint.SalesOrder,
        {'headers':{
            'Authorization': 'Bearer ' + req.session.token
        }},
        function(err, response, body){
            var data = JSON.parse(body);
            if(!data.data){
                req.session.error = 'Anauthorized'
                res.redirect('/');
            }else{
                if(req.session.updated){
                    var upd = req.session.updated;
                    req.session.updated =null
                }
                if(req.session.msg){
                    var msg = req.session.msg;
                    req.session.msg = null;
                }    
                res.render('sales',{data:data.data,upd : upd,msg:msg});
            }
            
        }
    );
})

router.route('/insert')
    .get(function(req,res,next){
        if(req.session.msg){
            var msg = req.session.msg;
            req.session.msg = null;
        }
        res.render('insert',{msg : msg});    
    })
    .post(function(req,res,next){
        var body = req.body;
        
        var postData = {
            "retailer_id" : body.retailer_id,
            "distributor_id" :body.distributor_id,
            "product_id" : body.product_id,
            "so_date" : body.so_date,
            "ordered_qty" : body.ordered_qty,
            "price"   : body.price,
            "total_price" : body.total_price,
            "spjb_id"  : body.spjb_id,
            "approved_qty" : body.approved_qty
        };
        
        request.post(
            config.Local_URL+config.Endpoint.SalesOrder,
            {'headers':{
                'Authorization': 'Bearer ' + req.session.token
                },
             'postData':postData
            },
            function(err,response,body){
                var responseBody = JSON.parse(body);
                
                if(responseBody.message){
                    req.session.msg = responseBody.message;
                    res.redirect('/sales/insert');
                }else{
                    res.send('test');
                }
            }
        );
    })

    router.route('/put')
    .post(function(req,res,next){
        var data = req.body;
        request.put(
            config.Local_URL+config.Endpoint.SalesOrder+'/'+data.so_id+'?reason_id=R01&reason_desc=salah entry',
            {'headers':{
                'Authorization': 'Bearer ' + req.session.token
            }},function(err,response,body){
                var responseBody = JSON.parse(body);
                if(responseBody.data){
                    req.session.updated = responseBody.data;
                }else
                if(responseBody.message){
                    req.session.msg = responseBody.message;
                }
                res.redirect('/sales');
            });
    })

    router.route('/delete')
    .post(function(req,res,next){
        var data = req.body;
        request.delete(
            config.Local_URL+config.Endpoint.SalesOrder+'/'+data.so_id,
            {'headers':{
                'Authorization': 'Bearer ' + req.session.token
            }},function(err,response,body){
                var responseBody = JSON.parse(body);
                if(responseBody.data){
                    req.session.updated = responseBody.data;
                }else
                if(responseBody.message){
                    req.session.msg = responseBody.message;
                }
                res.redirect('/sales');
            });
    })

module.exports = router;