var express = require('express');
var app = express();

const PORT = 8888;

app.use(express.static(__dirname + '/site'))

var server = app.listen(PORT, function () {
    console.log("Started app: %o", server.address());
});
console.log('Started server');