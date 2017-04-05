var express = require('express'),
	session = require('express-session'),
	anyDB = require('any-db'),
	bodyParser = require('body-parser'),
	expressValidator = require('express-validator'),
	crypto = require('crypto'),
//	csrf = require('csurf'),
	cookieParser = require('cookie-parser');

var pool = anyDB.createPool('mysql://root:root@127.0.0.1/FYP', {
    min: 2, max: 20
});

var inputPattern = {
    username: /^[\w- ']+$/,
    password: /^[\x20-\x7E]+$/
};

//var csrfProtection = csrf({ cookie: true });

function hmacPassword(password) {
    var hmac = crypto.createHmac('sha256', 'FYP2016');
    hmac.update(password);
    return hmac.digest('base64');
}

var app = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

app.use(cookieParser());

app.use(session({
    //store: new RedisStore({'host': config.redisHost, 'port': 6379}),
    name: '/admin/auth',
    secret: 'yR8gKGENDkamQkzQs8iA',
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/admin',
        maxAge: 60000 * 3 * 24,
        httpOnly: true
    }
}));
/*
app.use('/', function(req, res, next) {
	var schema = req.headers['x-forwarded-proto'];
	if (schema === 'https') {
		next();
	}
	else {
		res.redirect('https://' + req.headers.host + req.originalUrl);
	}
});
*/
app.get('/login', function (req, res) {
    if (req.session.admin)
        return res.redirect('/admin/user');
    res.render('login', {
        layout: 'login',
        title: '2016 Final Year Project'
    });
});

app.post('/api/login', function (req, res) {
    req.checkBody('username', 'Invalid Input in Username')
		.isLength(4, 512)
		.matches(inputPattern.username);
    req.checkBody('password', 'Invalid Input in Password')
		.isLength(4, 512)
		.matches(inputPattern.password);

    var errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        return res.status(400).json({ 'inputError': errors }).end();
    }
    //pool.query('INSERT INTO users (username, password, admin) VALUES ( ? , ? , 0)',
    pool.query('SELECT * FROM admin WHERE username = ? AND password = ? LIMIT 1',
		[req.body.username, hmacPassword(req.body.password)],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
		    if (result.rowCount === 0) {
		        return res.status(400).json({ 'loginError': 'Invalid Credentials' }).end();
		    }

		    req.session.regenerate(function (err) {
		        req.session.username = req.body.username;
		        req.session.admin = 1;
		        res.status(200).json({ 'loginOK': 1 }).end();
		    });
		}
	);
});

app.use('/', function (req, res, next) {
    if (req.session.admin)
        return next();
    else {
        if (req.originalUrl.indexOf('api') > -1)
            return res.status(400).json({ 'sessError': 'Session Expired' }).end();
        else
            return res.redirect('/admin/login');
    }
});

app.post('/api/logout', function (req, res) {
    req.session.destroy(function (err) {
        // cannot access session here
    });
    return res.redirect('/admin/login');
});

module.exports = app;
