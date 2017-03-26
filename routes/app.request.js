var express = require('express');
var anyDB = require('any-db');
//var csrf = require('csurf');
var cookieParser = require('cookie-parser');
var plotly = require('plotly')("philipcxj", "DtSALEZYkCYirIVEfWHu");
var fs = require('fs');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dateFormat = require('dateformat');

var app = express.Router();

var pool = anyDB.createPool('mysql://root:523422633@127.0.0.1/FYP2016', {
    min: 2, max: 10
});

var inputPattern = {
    name: /^[\w- ']+$/,
    price: /^\d+(?:\.\d{1,2})?$/,
    description: /^[\w- ',.!\r\n]+$/,
    URL: /^[\w- ',.!:\/\r\n]+$/,
};

//var csrfProtection = csrf({ cookie: true })

var app = express.Router();


// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// this line must be immediately after express.bodyParser()!
// Reference: https://www.npmjs.com/package/express-validator
app.use(expressValidator());

//var csrfProtection = csrf({ cookie: true });
app.post('/stat/:uid/:pid/:lid', function (req, res) {

    // put your input validations and/or sanitizations here
    // Reference: https://www.npmjs.com/package/express-validator
    // Reference: https://github.com/chriso/validator.js

    // quit processing if encountered an input validation error
    var now = new Date();
	var currentdate=dateFormat(now, "dd/mm/yyyy HH:MM:ss");

	var dformat = '%d/%m/%Y %H:%i:%s';
	

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

    // manipulate the DB accordingly using prepared statement 
    // (Prepared Statement := use ? as placeholder for values in sql statement; 
    //   They'll automatically be replaced by the elements in next array)
    pool.query('SELECT * FROM stat WHERE pid = (?) AND uid = (?) AND lid = (?) AND rdate = STR_TO_DATE(?, ?)',
		[req.params.pid, req.params.uid, req.params.lid, currentdate, dformat],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
		    if (result.rowCount == 0) {
		        pool.query('INSERT INTO stat (uid, pid, lid, count, rdate) VALUES (?, ?, ?, 1, STR_TO_DATE(?, ?))',
					[req.params.uid, req.params.pid, req.params.lid, currentdate, dformat],
					function (error, insert) {
					    if (error) {
					        console.error(error);
					        return res.status(500).json({ 'dbError': 'check server log' }).end();
					    }
					}
				);
		    } else {
		        pool.query('UPDATE stat set count = count + 1 WHERE uid = (?) AND pid = (?) AND lid = (?) AND rdate = STR_TO_DATE(?, ?)',
					[req.params.uid, req.params.pid, req.params.lid, currentdate, dformat],
					function (error, update) {
					    if (error) {
					        console.error(error);
					        return res.status(500).json({ 'dbError': 'check server log' }).end();
					    }
					}
				);
		    }
		    res.status(200).json({ 'Update Sucess!': 'yes' }).end();
		}
	);

});


app.post('/user/:uid', function (req, res) {

    // put your input validations and/or sanitizations here
    // Reference: https://www.npmjs.com/package/express-validator
    // Reference: https://github.com/chriso/validator.js

    // quit processing if encountered an input validation error

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

    // manipulate the DB accordingly using prepared statement 
    // (Prepared Statement := use ? as placeholder for values in sql statement; 
    //   They'll automatically be replaced by the elements in next array)
    pool.query('SELECT * FROM User WHERE uid = (?)',
		[req.params.uid],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
		    pool.query('SELECT * FROM UPrelation u, Picture p  WHERE uid = (?) AND u.pid = p.pid',
				[req.params.uid],
				function (error, relateion) {
				    if (error) {
				        console.error(error);
				        return res.status(500).json({ 'dbError': 'check server log' }).end();
				    }
				    //res.status(500).json({'dbError': 'check server log'}).end();
				    res.status(200).json({ 'User': result.rows, 'Picture': relateion.rows }).end();
				}
			);
		});

});

app.post('/loc/:lid', function (req, res) {
	
	var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }
	
	// manipulate the DB accordingly using prepared statement 
    // (Prepared Statement := use ? as placeholder for values in sql statement; 
    //   They'll automatically be replaced by the elements in next array)
    pool.query('SELECT * FROM Location WHERE lid = (?)',
		[req.params.lid],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
		    pool.query('SELECT * FROM PLrelation l, Picture p  WHERE lid = (?) AND l.pid = p.pid',
				[req.params.lid],
				function (error, relateion) {
				    if (error) {
				        console.error(error);
				        return res.status(500).json({ 'dbError': 'check server log' }).end();
				    }
				    //res.status(500).json({'dbError': 'check server log'}).end();
				    res.status(200).json({ 'Location': result.rows, 'Picture': relateion.rows }).end();
				}
			);
		});
});

app.post('/pic/:pid', function (req, res) {

    // put your input validations and/or sanitizations here
    // Reference: https://www.npmjs.com/package/express-validator
    // Reference: https://github.com/chriso/validator.js

    // quit processing if encountered an input validation error

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

    // manipulate the DB accordingly using prepared statement 
    // (Prepared Statement := use ? as placeholder for values in sql statement; 
    //   They'll automatically be replaced by the elements in next array)
    pool.query('SELECT * FROM Picture WHERE pid = (?)',
		[req.params.pid],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
		    res.status(200).json({ 'Picture': result.rows }).end();
		}
	);

});

module.exports = app;