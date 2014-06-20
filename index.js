var concat = require('concat-stream'),
    url = require('url'),
    _ = require('underscore'),
    http = require('http'),
    https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = function(config) {
    config.forEach(function(c) {
        c.parsed_url = url.parse(c.url);
    });
    function handleRequest(req, res) {
        if (req.method === 'POST' || req.method === 'PUT') {
            req.pipe(concat(function(requestBody) {
                try {
                    var requestData = JSON.parse(requestBody.toString());
                    for (var i = 0; i < config.length; i++) {
                        route(requestData, req, res, config[i]);
                    }
                } catch(e) {
                    console.error(e);
                } finally {
                    res.writeHead(200);
                    res.end('');
                }
            }));
        } else {
            res.writeHead(200);
            res.end('');
        }
    }
    function route(data, incomingRequest, response, config) {
        var protocol = config.parsed_url.protocol === 'https:' ?
            https : http;

        var opts = _.extend(config.parsed_url, {
            headers: {
                'content-type': 'application/json',
                'content-length': JSON.stringify(data).length
            },
            method: incomingRequest.method,
            port: config.parsed_url.port || (protocol === https ? 443 : 80)
        });

        var req = protocol.request(opts);

        req.on('response', function(res) {
            var body = '';
            res.on('data', function(chunk) {
                console.log('got data');
                body += chunk.toString();
            });
            res.on('end', function() {
                console.log('done');
                console.log(body);
            });
        });

        req.on('error', function(e) {
            console.log(e);
        });

        req.end(JSON.stringify(data));
    }
    return handleRequest;
};
