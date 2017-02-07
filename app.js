var express = require('express'),
    exphbs  = require('express-secure-handlebars'),

  	https = require('https'),
  	http = require('http'),
    fs = require("fs"),


	authAPIRouter = require('./routes/auth.api.js'),
//    frontEndRouter = require('./routes/frontend.js'),
    backEndRouter = require('./routes/backend.js'),
    backEndAPIRouter = require('./routes/backend.api.js');

var ssl = require('./sslLicense.js');

var app = express();

// TODO: the default layout is not included in the sample code
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


// serve static files from the public folder
app.use(express.static(__dirname + '/public'));

// backend routers run first
app.use('/admin', authAPIRouter);

app.use('/admin/api', backEndAPIRouter);
app.use('/admin', backEndRouter);

app.get('*', function(req, res) {
    res.redirect('/');
});
/*
app.listen(process.env.PORT || 8080, function () {
    console.log('Example Server listening at port ' + (process.env.PORT || 8080));
});
*/
//app.set('port', process.env.PORT || 3000);
app.set('httpsport', 8080);


//var httpServer = http.createServer(app).listen(app.get('port'));
var httpsServer = https.createServer(ssl.options, app).listen(app.get('httpsport'));