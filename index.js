var http = require('http'),
    fs = require('fs'),
    _ = require('underscore'),
    concat = require('concat-stream'),
    url = require('url'),
    argv = require('minimist')(process.argv.slice(2));

argv.config = argv.config || 'config.json';

var config = [];

if (fs.existsSync(argv.config)) {
    config = JSON.parse(fs.readFileSync(argv.config));
} else {
    console.error('no config file found, no rules in effect.');
}

config.forEach(function(c) {
    c.parsed_url = url.parse(c.url);
});

var server = http.createServer(handleRequest);

server.listen(3000, function() {
    console.error('server listening on port', server.address().port);
});

function handleRequest(req, res) {
    if (req.method === 'POST' || req.method === 'PUT') {
        req.pipe(concat(function(requestBody) {
            try {
                var requestData = JSON.parse(requestBody);
                res.end();
                for (var i = 0; i < config.length; i++) {
                    if (_.match(requestData, config[i])) {
                        return route(requestData, req, res, config[i]);
                    }
                }
            } catch(e) {
                res.end();
            }
        }));
    } else {
        res.end('post and put only');
    }
}

function route(data, incomingRequest, response, config) {
    var req = http.request(_.extend(config.parsed_url, {
        headers: incomingRequest.headers,
        method: incomingRequest.method
    }));
    req.write(JSON.stringify(data));
    req.end();
}
