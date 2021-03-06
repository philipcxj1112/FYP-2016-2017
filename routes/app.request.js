var express = require('express');
var anyDB = require('any-db');
//var csrf = require('csurf');
var cookieParser = require('cookie-parser');
var plotly = require('plotly')("philipcxj", "DtSALEZYkCYirIVEfWHu");
var fs = require('fs');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dateFormat = require('dateformat');
var config = require('../config.js');

var app = express.Router();

var pool = anyDB.createPool(config.dbURI, {
    min: 2, max: 10
});

var inputPattern = {
    name: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
    price: /^\d+(?:\.\d{1,2})?$/,
    description: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
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
	pool.query('INSERT INTO stat (uid, pid, lid, count, rdate) VALUES (?, ?, ?, 1, STR_TO_DATE(?, ?))',
		[req.params.uid, req.params.pid, req.params.lid, currentdate, dformat],
		function (error, insert) {
			if (error) {
				console.error(error);
				return res.status(500).json({ 'dbError': 'check server log' }).end();
			}
		
		res.status(200).json({ 'Update Sucess!': 'yes' }).end();
	});

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
		    if (result.rowCount == 0){
		    	res.status(200).json({ 'User': result.rows, 'Picture': [] }).end();
		    }else{
		   		pool.query('SELECT * FROM UPrelation u, Picture p  WHERE uid = (?) AND u.pid = p.pid',
					[result.rows[0].uid],
					function (error, relateion) {
				    	if (error) {
				    	    console.error(error);
				        	return res.status(500).json({ 'dbError': 'check server log' }).end();
				    	}
				   		 //res.status(500).json({'dbError': 'check server log'}).end();
				    	res.status(200).json({ 'User': result.rows, 'Picture': relateion.rows }).end();
					}
				);
		   	}
		});

});

app.post('/loc/:UUID/:major', function (req, res) {

	var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

	// manipulate the DB accordingly using prepared statement
    // (Prepared Statement := use ? as placeholder for values in sql statement;
    //   They'll automatically be replaced by the elements in next array)
    //console.log(req.params.UUID);
//    console.log(req.params.major);
//    console.log(req.params.minor);
    pool.query('SELECT * FROM PLrelation l, Picture p, (SELECT * FROM Location WHERE UUID = (?) AND major = (?) ) AS TEMP  WHERE l.lid = TEMP.lid AND l.pid = p.pid ',
		[req.params.UUID, req.params.major],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
            //console.log(result.rows);
            res.status(200).json({ 'Location': result.rows }).end();
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

app.post('/test/:uid', function(req, res){
	var now = new Date();
	var currentdate=dateFormat(now, "dd/mm/yyyy HH:MM:ss");

	var dformat = '%d/%m/%Y %H:%i:%s';

	pool.query('INSERT INTO test (uid, tdate) VALUES ((?), STR_TO_DATE(?, ?))',
		[req.params.uid, currentdate, dformat],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
		    res.status(200).json({ status: 'Sucess' }).end();
		}
	);

});

module.exports = app;
