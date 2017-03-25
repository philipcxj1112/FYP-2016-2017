var express = require('express');
var anyDB = require('any-db');
//var csrf = require('csurf');
var cookieParser = require('cookie-parser');
var plotly = require('plotly')("philipcxj", "DtSALEZYkCYirIVEfWHu");
var fs = require('fs');

var app = express.Router();

var pool = anyDB.createPool('mysql://root:523422633@127.0.0.1/FYP2016', {
    min: 2, max: 10
});

//var csrfProtection = csrf({ cookie: true });


module.exports = app;