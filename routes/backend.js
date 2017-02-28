var express = require('express');
var anyDB = require('any-db');
//var csrf = require('csurf');
var cookieParser = require('cookie-parser');

var app = express.Router();

var pool = anyDB.createPool('mysql://root:523422633@127.0.0.1/FYP2016', {
    min: 2, max: 10
});

//var csrfProtection = csrf({ cookie: true });

app.use(cookieParser());

// URL expected: http://hostname/admin/user
app.get('/user', function (req, res) {
    // async fetch data from SQL, render page when ready

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
            res.render('admin-panel-User', {
                layout: 'admin',
                title: '2016 Final Year Project',
                user: user.rows,
                type: type.rows
            });
        });
    });
});

// URL expected: http://hostname/admin/loc
app.get('/loc', function (req, res) {
    // async fetch data from SQL, render page when ready

    pool.query('SELECT * FROM Location', function (error, loc) {
        if (error) {
            console.error(error);
            res.status(500).end();
            return;
        }
        res.render('admin-panel-Location', {
            layout: 'admin',
            title: '2016 Final Year Project',
            loc: loc.rows,
        });
    });
});

// URL expected: http://hostname/admin/pic
app.get('/pic', function (req, res) {
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
                    res.render('admin-panel-Picture', {
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

// URL expected: http://hostname/admin/result
app.get('/result', function (req, res) {
    // async fetch data from SQL, render page when ready

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
            res.render('admin-panel-User', {
                layout: 'admin',
                title: '2016 Final Year Project',
                user: user.rows,
                type: type.rows
            });
        });
    });
});


module.exports = app;