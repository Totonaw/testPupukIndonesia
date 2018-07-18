var express = require('express');
var router = express.Router();
var config = require('config');
var request = require('request');

router.use(function(req,res,next){
    req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjY3YjA0Y2I0MDFlZjBhMjg5MmRjZTc1NGQ2MzA3NmYwY2Q1MTYxZTAzMDY5YTA2YzcyNWM1NTgzNWRmYmM1ODhkOWQ5MDdhYTkwYTdlNWIzIn0.eyJhdWQiOiIyIiwianRpIjoiNjdiMDRjYjQwMWVmMGEyODkyZGNlNzU0ZDYzMDc2ZjBjZDUxNjFlMDMwNjlhMDZjNzI1YzU1ODM1ZGZiYzU4OGQ5ZDkwN2FhOTBhN2U1YjMiLCJpYXQiOjE1MzE5MDk2MjQsIm5iZiI6MTUzMTkwOTYyNCwiZXhwIjoxNTYzNDQ1NjI0LCJzdWIiOiIxMzgyMyIsInNjb3BlcyI6W119.x-7Ql7yYbYSOwkJ1QLRO-fkp7jLy0IbMIUO7KVKfv3rhwoFar7-cevKend5cHAO-E6Hu2hpC2hMt9woaNl2L9EOK6dNte3HtlerRdV490Isdw6z94yS8SUsOcLbCj2-hN3reJtDaNrQJDQpmdMAbXu7-7n_4KD5zWQ5933xwVQkoDRCyC_Hsjxs8a91LZDWi1QtIsR_VtGUUFeM09lRC7uoRIqxl5qkoGHFwwymzpBJ4ZNKw4EzCeK6w0qhvO2qxvbBpSfPxI1sbnOFh4tOLVHx1wVqr059fRPrHXhTyVy_vysaNQDNiuTksrWHCn8LMfVunm0FNnW3RZvIrX3W4ieB-P3pRo1dNXrMAbjero_wnv1qIM-v2jZDIbk1Cd5U_s685ajjXtnCJ5LZO5jvp7KEvk4s2FoCW6wI5FSnuo0tykaWhcn8p0bz7lTcTRrCvNtQVR0oN2AnVwswzWGz4xdTP1Aol1OMiHb7Vxoe4_I3u8Xy_KoXOFJLuJcFzU-UddGSH3ZFYcUbb-5txXmh6ggkKbsD0EaiR5IARkHTkMWxLPMyGNMyyndxP6hWjqa4W8IPLdE6bCpjOPgWUkOXfEF18hu7KgfIj_x3GQL8ZrUDdtubmCxOinPicwI9YphJoiYVZppRyuJwWLc7yO24c4ApN96T9NAzvRbYPc9tzJbk";
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