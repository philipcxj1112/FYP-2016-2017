var fs = require('fs');

//ssl license

var keyPath = './server.key.pem';
var certPath = './server.cert.signed.pem';

var hskey = fs.readFileSync(keyPath);
var hscert = fs.readFileSync(certPath);

var options = {
    key: hskey,
    cert: hscert,
    passphrase: '523422633'
};

//ssl object

var ssl = {};

ssl.options = options;

module.exports = ssl;
