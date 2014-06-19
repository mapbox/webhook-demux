var test = require('tape'),
    http = require('http'),
    concat = require('concat-stream'),
    receiver = require('./receiver'),
    webhookDemux = require('../');

var cats = { cats: true };
var dogs = { dogs: true };

test('webhook-demux no config', function(t) {
    var config = [];
    var handler = webhookDemux(config);
    t.ok(handler, 'creates handler');
    var server = http.createServer(handler);
    server.listen(0);
    server.on('listening', function() {
        var req = send(JSON.stringify(cats), server.address().port, 'POST');
        req.on('response', function(resp) {
            resp.pipe(concat(function(data) {
                t.deepEqual(data, []);
                server.close(function() {
                    t.end();
                });
            }));
        });
    });
});

function send(data, port, method) {
    var req = http.request({
        port: port,
        host: 'localhost',
        method: method
    });
    req.end(data);
    return req;
}
