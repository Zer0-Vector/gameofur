let express = require('express');
let path = require('path');
let app = express();


const PORT = 8888;

app.use(express.static(path.join(__dirname, 'site')));
app.use(express.static(path.join(__dirname, 'site', 'json')))

let server = app.listen(PORT, function () {
    console.log("Started app: %o", server.address());
});
console.log('Started server');