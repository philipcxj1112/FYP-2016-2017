var express = require('express');
var anyDB = require('any-db');
//var csrf = require('csurf');
var cookieParser = require('cookie-parser');

var app = express.Router();

var pool = anyDB.createPool('mysql://root:root@127.0.0.1/FYP', {
	min: 2, max: 10
});

//var csrfProtection = csrf({ cookie: true });

app.use(cookieParser());

// URL expected: http://hostname/admin
app.get('/',  function (req, res) {
	// async fetch data from SQL, render page when ready
	pool.query('SELECT * FROM Picture', function (error, picture) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}
		pool.query('SELECT * FROM Location', function (error, loc) {
			if (error) {
				console.error(error);
				res.status(500).end();
				return;
			}
			pool.query('SELECT * FROM User', function (error, user) {
				if (error) {
					console.error(error);
					res.status(500).end();
					return;
				}
				pool.query('SELECT * FROM Usertype', function (error, type) {
				if (error) {
					console.error(error);
					res.status(500).end();
					return;
				}
					res.render('admin-panel', {
						layout: 'admin',
						title: '2016 Final Year Project',
						pic: picture.rows,
						user: user.rows,
						loc: loc.rows,
						type: type.rows
					});
				});
			});
		});
	});
});

module.exports = app;
