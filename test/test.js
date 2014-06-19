var test = require('tap').test,
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
        var req = send(cats, server.address().port);
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

test('webhook-demux with config', function(t) {
    var server;
    receiver(t, [cats],
    function(port) {
        var config = [{
            match: { cats: true },
            url: 'http://localhost:' + port
        }];
        var handler = webhookDemux(config);
        server = http.createServer(handler);
        server.listen(0);
        server.on('listening', function() {
            send(dogs, server.address().port);
            send(cats, server.address().port);
        });
    },
    function() {
        server.close(function() {
            t.end();
        });
    });
});

function send(data, port) {
    var req = http.request({
        port: port,
        host: 'localhost',
        method: 'POST'
    });
    req.end(JSON.stringify(data));
    return req;
}
