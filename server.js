var http = require('http'),
    fs = require('fs'),
    argv = require('minimist')(process.argv.slice(2)),
    webhookDemux = require('./');

argv.config = argv.config || 'config.json';

var config = [];

if (fs.existsSync(argv.config)) {
    config = JSON.parse(fs.readFileSync(argv.config));
} else {
    console.error('no config file found, no rules in effect.');
}

var handler = webhookDemux(config);

var server = http.createServer(handler);

server.listen(3000, function() {
    console.error('server listening on port', server.address().port);
});
