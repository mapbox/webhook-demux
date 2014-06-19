var concat = require('concat-stream'),
    url = require('url'),
    _ = require('underscore'),
    http = require('http');

module.exports = function(config) {

    config.forEach(function(c) {
        c.parsed_url = url.parse(c.url);
        c.matcher = _.matches(c.match);
    });

    function handleRequest(req, res) {
        if (req.method === 'POST' || req.method === 'PUT') {
            req.pipe(concat(function(requestBody) {
                try {
                    var requestData = JSON.parse(requestBody.toString());
                    for (var i = 0; i < config.length; i++) {
                        if (config[i].matcher(requestData)) {
                            route(requestData, req, res, config[i]);
                        }
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
        var req = http.request(_.extend(config.parsed_url, {
            headers: incomingRequest.headers,
            method: incomingRequest.method
        }));
        req.write(JSON.stringify(data));
        req.end();
    }

    return handleRequest;
};
