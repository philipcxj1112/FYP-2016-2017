var express = require('express');
var anyDB = require('any-db');
//var config = require('../config.js');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
//var csrf = require('csurf');
var fs = require('fs');
var multer = require('multer');
var plotly = require('plotly')("philipcxj", "DtSALEZYkCYirIVEfWHu")
var dateFormat = require('dateformat');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname )
  }
})

var upload = multer({ storage: storage })



//var upload = multer({ dest: 'public/uploads/' });

var pool = anyDB.createPool('mysql://root:523422633@127.0.0.1/FYP2016', {
    min: 2, max: 20
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
/*
app.use('/', function(req, res, next) {
	console.log(req.body);
	return next();
});
*/
// URL expected: http://hostname/admin/api/cat/add

app.post('/user/add', function (req, res) {

    // put your input validations and/or sanitizations here
    // Reference: https://www.npmjs.com/package/express-validator
    // Reference: https://github.com/chriso/validator.js
    req.checkBody('pref', 'Invalid Preference')
		.notEmpty()
		.isInt();
    req.checkBody('uname', 'Invalid User Name')
		.isLength(1, 512)
		.matches(inputPattern.name);
	req.checkBody('sid', 'Invalid User ID')
		.isLength(1, 512)
		.matches(inputPattern.name);
    req.checkBody('utscore', 'Invalid User Test Score Input')
		.isLength(1, 512)
		.matches(inputPattern.name);
	req.checkBody('udesc', 'Invalid Description')
		.isLength(1, 512)
		.matches(inputPattern.description);
		
    // quit processing if encountered an input validation error
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

    // manipulate the DB accordingly using prepared statement 
    // (Prepared Statement := use ? as placeholder for values in sql statement; 
    //   They'll automatically be replaced by the elements in next array)
    pool.query('INSERT INTO User (pref, uname, sid, utscore, description) VALUES (?, ?, ?, ?, ?)',
		[req.body.pref, req.body.uname, req.body.sid, req.body.utscore, req.body.udesc],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }

		    res.status(200).json(result).end();
		}
	);

});

app.post('/pic/location/add', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'sound', maxCount: 1 }]),  function (req, res) {

    // put your input validations and/or sanitizations here
    // Reference: https://www.npmjs.com/package/express-validator
    // Reference: https://github.com/chriso/validator.js
	console.log(req.files);
	
    req.checkBody('lid', 'Invalid Location ID')
		.notEmpty()
		.isInt();
    req.checkBody('description', 'Invalid Product Description')
		.isLength(1, 1024)
		.matches(inputPattern.description);
   req.checkBody('pname', 'Invalid Picture Name')
		.isLength(1, 512)
		.matches(inputPattern.name);
    // quit processing if encountered an input validation error
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }
	
	if (!req.files) {
        return res.status(403).json({'InputError':'expect 2 file upload'}).end();
    }

    var upload = req.files;

    if (!/^image\/(jpeg|png|gif)$/i.test(upload.img[0].mimetype)) {
        return res.status(403).json({'imageInputError':'expect image file'}).end();
    }

    if (!/^audio\/(mp3|wma)$/i.test(upload.sound[0].mimetype)) {
        return res.status(403).json({'imageInputError':'expect sound file'}).end();
    }
	
	var imgurl = '/uploads/'+ req.files.img[0].originalname;
	
	var soundurl = '/uploads/' +req.files.sound[0].originalname;
	
	console.log(imgurl);
	console.log(soundurl);
	console.log(req.files);
	
    // manipulate the DB accordingly using prepared statement 
    // (Prepared Statement := use ? as placeholder for values in sql statement; 
    //   They'll automatically be replaced by the elements in next array)
    pool.query('SELECT * FROM Location WHERE lid = (?)',
		[req.body.lid],
		function (error, loctest) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
		    if (loctest.rowCount == 0) {
		        return res.status(400).json({ 'inputError': 'Invalid Location' }).end();
		    }
		    else {
		        pool.query('INSERT INTO Picture (imgurl, soundurl, description, pname) VALUES (?, ?, ?, ?)',
					[ imgurl, soundurl, req.body.description, req.body.pname],
					function (error, result) {
					    if (error) {
					        console.error(error);
					        return res.status(500).json({ 'dbError': 'check server log' }).end();
					    }
						pool.query('SELECT * FROM Picture WHERE imgurl = ? AND soundurl = ?',
							[imgurl, soundurl],
							function (error, pic) {
								if (error) {
									console.error(error);
									return res.status(500).json({ 'dbError': 'check server log' }).end();
								}
								pool.query('INSERT INTO PLrelation (lid, pid) VALUES (?, ?)',
									[req.body.lid, pic.rows[0].pid],
									function (error, update) {
										if (error) {
											console.error(error);
											return res.status(500).json({ 'dbError': 'check server log' }).end();
										}						
										res.status(200).json(result).end();
								});
						});
					}
                );
		    }
		}
	);

});

app.post('/pic/personal/add', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'sound', maxCount: 1 }]), function (req, res) {

    // put your input validations and/or sanitizations here
    // Reference: https://www.npmjs.com/package/express-validator
    // Reference: https://github.com/chriso/validator.js
	//console.log(req.files.img);
	


    req.checkBody('uid', 'Invalid User ID')
		.notEmpty()
		.isInt();
    req.checkBody('description', 'Invalid Product Description')
		.isLength(1, 1024)
		.matches(inputPattern.description);
    var lid = 1;
    // quit processing if encountered an input validation error
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

	if (!req.files) {
        return res.status(403).json({'InputError':'expect 2 file upload'}).end();
    }

    var upload = req.files;

    //console.log(upload.img[0].fieldname);

    if (!/^image\/(jpeg|png|gif|jpg)$/i.test(upload.img[0].mimetype)) {
        return res.status(403).json({'imageInputError':'expect image file'}).end();
    }

    if (!/^audio\/(mp3|wma)$/i.test(upload.sound[0].mimetype)) {
        return res.status(403).json({'imageInputError':'expect audio file'}).end();
    }
	
	var imgurl = '/uploads/'+ req.files.img[0].originalname;
	
	var soundurl = '/uploads/' +req.files.sound[0].originalname;
	
	console.log(imgurl);
	console.log(soundurl);
	console.log(req.files);

    // manipulate the DB accordingly using prepared statement 
    // (Prepared Statement := use ? as placeholder for values in sql statement; 
    //   They'll automatically be replaced by the elements in next array)
    pool.query('SELECT * FROM Picture Where imgurl = (?) AND soundURL = (?)',
		[imgurl, soundurl],
		function (error, pcheck) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
		    if (pcheck.rowCount == 0) {
		        pool.query('INSERT INTO Picture (imgurl, soundurl, description, pname) VALUES ( ?, ?, ?, ?)',
                    [ imgurl, soundurl, req.body.description, req.body.pname],
                     function (error, insert) {
                         if (error) {
                             console.error(error);
                             return res.status(500).json({ 'dbError': 'check server log' }).end();
                         }
                         pool.query('SELECT pid FROM Picture WHERE imgurl = (?) AND soundURL = (?)',
                            [imgurl, soundurl],
                            function (error, getpid) {
                                if (error) {
                                    console.error(error);
                                    return res.status(500).json({ 'dbError': 'check server log' }).end();
                                }
                                pool.query('INSERT INTO UPrelation (pid, uid) VALUES (?, ?)',
                                    [getpid.rows[0].pid, req.body.uid],
                                    function (error, result) {
                                        if (error) {
                                            console.error(error);
                                            return res.status(500).json({ 'dbError': 'check server log' }).end();
                                        }
                                        res.status(200).json(result).end();
                                    }
                                );
                            }
                        );
                     }
                );
		    }
		    else {
		        pool.query('INSERT INTO UPrelation (uid, pid) VALUES (?, ?)',
                    [pcheck.rows.pid, req.body.uid],
                    function (error, result) {
                        if (error) {
                            console.error(error);
                            return res.status(500).json({ 'dbError': 'check server log' }).end();
                        }
                        res.status(200).json(result).end();
                    }
                );
		    }
		});
});


app.post('/pic/edit', function (req, res) {

	req.checkBody('pid', 'Invalid Product ID')
		.notEmpty()
		.isInt();
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}
	pool.query('SELECT * FROM Picture WHERE pid = ?', 
		[req.body.pid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			// construct an error body that conforms to the inputError format
			if (result.affectedRows === 0) {
				return res.status(400).json({'inputError': [{
					param: 'pid', 
					msg: 'Invalid Product ID', 
					value: req.body.pid
				}]}).end();	
			}
			res.status(200).json({'picEdit': result.rows}).end();
	});
});

app.post('/pic/edit/update', function (req, res) {

	req.checkBody('pid', 'Invalid Product ID')
		.notEmpty()
		.isInt();
    req.checkBody('lid', 'Invalid Location ID')
		.notEmpty()
		.isInt();
    req.checkBody('description', 'Invalid Product Description')
		.isLength(1, 1024)
		.matches(inputPattern.description);
   	req.checkBody('pname', 'Invalid Picture Name')
		.isLength(1, 512)
		.matches(inputPattern.name);

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}
	pool.query('UPDATE Picture SET description = ?, pname = ? WHERE pid = ?', 
		[req.body.lid, req.body.description, req.body.pname ,req.body.pid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			console.log(result);
			// construct an error body that conforms to the inputError format
			if (result.affectedRows === 0) {
				return res.status(400).json({'inputError': [{
					param: 'pid', 
					msg: 'Invalid Product ID', 
					value: req.body.pid
				}]}).end();	
			}
			res.status(200).json({'UPdate': 'Sucess'}).end();
	});
});


app.post('/location/add', function (req, res) {

    // put your input validations and/or sanitizations here
    // Reference: https://www.npmjs.com/package/express-validator
    // Reference: https://github.com/chriso/validator.js
    req.checkBody('major', 'Invalid Major Input')
		.notEmpty()
		.isInt();
    req.checkBody('minor', 'Invalid Minor Input')
		.notEmpty()
		.isInt();
    req.checkBody('UUID', 'Invalid UUID')
		.isLength(1, 512)
		.matches(inputPattern.name);
    req.checkBody('lname', 'Invalid Location Name')
		.isLength(1, 512)
		.matches(inputPattern.name);

    // quit processing if encountered an input validation error
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

    // manipulate the DB accordingly using prepared statement 
    // (Prepared Statement := use ? as placeholder for values in sql statement; 
    //   They'll automatically be replaced by the elements in next array)
    pool.query('INSERT INTO Location (UUID, major, minor, lname) VALUES (?, ?, ?, ?)',
		[req.body.UUID, req.body.major, req.body.minor, req.body.lname],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }

		    res.status(200).json(result).end();
		}
	);

});


app.post('/pic/count', function (req, res) {

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
    pool.query('SELECT COUNT(pid) FROM Picture',
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

app.post('/pic/remove', function (req, res) {
    req.checkBody('pid', 'Invalid Picture ID')
		.notEmpty()
		.isInt();

    // quit processing if encountered an input validation error
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

    pool.query('DELETE FROM Picture WHERE pid = ? LIMIT 1',
		[req.body.pid],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }

		    if (result.affectedRows === 0) {
		    	return res.status(400).json({
		        	'inputError': [{
		         		param: 'pid',
		         		msg: 'Invalid Picture ID',
		                value: req.body.pid
		            }]
		   		}).end();
		    }
		    pool.query('DELETE FROM PLrelation WHERE pid = ?',
				[req.body.pid],
				function (error, lprelate) {
		    		if (error) {
		        		console.error(error);
		        		return res.status(500).json({ 'dbError': 'check server log' }).end();
		    		}
		    		pool.query('DELETE FROM UPrelation WHERE pid = ?',
						[req.body.pid],
						function (error, uprelate) {
		    				if (error) {
		        				console.error(error);
		        				return res.status(500).json({ 'dbError': 'check server log' }).end();
		    				}
		   		 			res.status(200).json(result).end();
		   		 		});
		    	});
		});
});

app.post('/loc/remove', function (req, res) {
    req.checkBody('lid', 'Invalid Picture ID')
		.notEmpty()
		.isInt();

    // quit processing if encountered an input validation error
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

    pool.query('DELETE FROM Location WHERE lid = ? LIMIT 1',
		[req.body.lid],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }

		    if (result.affectedRows === 0) {
		        return res.status(400).json({
		            'inputError': [{
		                param: 'lid',
		                msg: 'Invalid Picture ID',
		                value: req.body.lid
		            }]
		        }).end();
		    }
		    res.status(200).json(result).end();
		});
});

app.post('/user/remove', function (req, res) {
    req.checkBody('uid', 'Invalid User ID')
		.notEmpty()
		.isInt();

    // quit processing if encountered an input validation error
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

    pool.query('DELETE FROM User WHERE uid = ? LIMIT 1',
		[req.body.uid],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
			
			if (result.affectedRows === 0) {
		        return res.status(400).json({
		            'inputError': [{
		                param: 'uid',
		                msg: 'Invalid User ID',
		                value: req.body.uid
		            }]
		        }).end();
		    }
			
			pool.query('DELETE FROM UPrelation WHERE uid = ? ',
				[req.body.uid],
				function (error, result) {
					if (error) {
						console.error(error);
						return res.status(500).json({ 'dbError': 'check server log' }).end();
					}

					res.status(200).json(result).end();
				});
		});
});

app.post('/pic/remove', function (req, res) {
    req.checkBody('pid', 'Invalid Picture ID')
		.notEmpty()
		.isInt();

    // quit processing if encountered an input validation error
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

    pool.query('DELETE FROM Picture WHERE pid = ? LIMIT 1',
		[req.body.pid],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }

		    if (result.affectedRows === 0) {
		        return res.status(400).json({
		            'inputError': [{
		                param: 'pid',
		                msg: 'Invalid Picture ID',
		                value: req.body.uid
		            }]
		        }).end();
		    }
		    res.status(200).json(result).end();
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
//new
app.post('/user/edit/update', function (req, res) {
    req.checkBody('uid', 'Invalid User ID')
		.notEmpty()
		.isInt();		
    req.checkBody('utscore', 'Invalid User Test Score Input')
		.isLength(1, 512)
		.matches(inputPattern.name);
	req.checkBody('udesc', 'Invalid Description')
		.isLength(1, 512)
		.matches(inputPattern.description);

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}
	pool.query('UPDATE User SET utscore = ?, description = ? WHERE uid = ?', 
		[req.body.utscore, req.body.udesc, req.body.uid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			// construct an error body that conforms to the inputError format
			if (result.affectedRows === 0) {
				return res.status(400).json({'inputError': [{
					param: 'uid', 
					msg: 'Invalid User ID', 
					value: req.body.uid
				}]}).end();	
			}
			res.status(200).json({'UPdate': 'Sucess'}).end();
	});
});
//new
app.post('/user/edit', function (req, res) {
    req.checkBody('uid', 'Invalid User ID')
		.notEmpty()
		.isInt();
		
    // quit processing if encountered an input validation error
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }

    pool.query('SELECT * FROM User WHERE uid = (?)',
		[req.body.uid],
		function (error, result) {
		    if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
			
			if (result.affectedRows === 0) {
		        return res.status(400).json({
		            'inputError': [{
		                param: 'uid',
		                msg: 'Invalid User ID',
		                value: req.body.uid
		            }]
		        }).end();
			
			
		    }
		    res.status(200).json({'userEdit': result.rows}).end();
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
		    pool.query('SELECT pid FROM Picture WHERE uid = (?)',
				[req.params.uid],
				function (error, user) {
				    if (error) {
				        console.error(error);
				        return res.status(500).json({ 'dbError': 'check server log' }).end();
				    }
				    //res.status(500).json({'dbError': 'check server log'}).end();
				    res.status(200).json({ 'User': result.rows, 'Personal': user.rows }).end();
				}
			);
		});

});

app.get('/stat/:uid/:pid/:lid', function (req, res) {

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


app.post('/result', function (req, res) {
	
	req.checkBody('uid', 'Invalid User ID')
		.notEmpty()
		.isInt();
	req.checkBody('weekofday', 'Invalid User ID')
		.notEmpty()
		.isInt();
	req.checkBody('lid', 'Invalid User ID')
		.notEmpty()
		.isInt();
		
    // quit processing if encountered an input validation error
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ 'inputError': errors }).end();
    }
	
	
	pool.query('SELECT TIME(t2.start_time) AS time, IFNULL(temp.tcount, 0) AS count FROM timetable t2 LEFT JOIN (SELECT TIME(t.start_time) AS time, COUNT(*) AS tcount FROM timetable t, stat s WHERE s.rdate >= CURDATE() - INTERVAL 1 WEEK AND DAYOFWEEK(rdate) = (?) AND TIME(s.rdate) BETWEEN TIME(t.start_time) AND time(t.end_time) AND s.uid = (?) AND s.lid = (?) GROUP BY t.start_time) AS temp ON temp.time = TIME(t2.start_time);', 
		[req.body.weekofday, req.body.uid, req.body.lid],
		function (error, result) {
			if (error) {
		        console.error(error);
		        return res.status(500).json({ 'dbError': 'check server log' }).end();
		    }
			console.log(result.rows);
			var trace1 = {
				x: [],
				y: [],
				type: "scatter"
			};
			
			for(var i = 0; i < result.rowCount; i++){
				trace1.x[i] = result.rows[i].time;
				trace1.y[i] = result.rows[i].count;
			}
	
			var figure = { 'data': [trace1] };

			var imgOpts = {
				format: 'png',
				width: 1000,
				height: 500
			};

			plotly.getImage(figure, imgOpts, function (error, imageStream) {
				if (error) return console.log (error);

				var fileStream = fs.createWriteStream('./public/graph/plotly.png');
				imageStream.pipe(fileStream);
			});
			res.status(200).json({ status: 'Sucess' }).end();
		}
	);
	

	
});



module.exports = app;
