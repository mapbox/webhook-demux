var test = require('tape'),
    http = require('http'),
    concat = require('concat-stream'),
    receiver = require('./receiver'),
    webhookDemux = require('../');

var cats = { cats: true };
var poem = {"text":"古池や蛙飛び込む水の音 ふるいけやかわずとびこむみずのおと"};

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

test('webhook-demux receiver', function(t) {
    receiver(function(recv) {
        var config = [{
            url: 'http://' + recv.server.address().address + ':' + recv.port + '/'
        }];
        var handler = webhookDemux(config);
        t.ok(handler, 'creates handler');
        var server = http.createServer(handler);
        server.listen(0);
        server.on('listening', function() {
            var req = send(JSON.stringify(cats), server.address().port, 'POST');
            setTimeout(function() {
                t.deepEqual(recv.received, [cats], 'got cats');
                recv.server.close(function() {
                    server.close(function() {
                        t.end();
                    });
                });
            }, 100);
        });
    });
});

test('webhook-demux receiver w PUT', function(t) {
    receiver(function(recv) {
        var config = [{
            url: 'http://' + recv.server.address().address + ':' + recv.port + '/'
        }];
        var handler = webhookDemux(config);
        t.ok(handler, 'creates handler');
        var server = http.createServer(handler);
        server.listen(0);
        server.on('listening', function() {
            var req = send(JSON.stringify(cats), server.address().port, 'PUT');
            setTimeout(function() {
                t.deepEqual(recv.received, [cats], 'got cats');
                recv.server.close(function() {
                    server.close(function() {
                        t.end();
                    });
                });
            }, 100);
        });
    });
});

test('webhook-demux receiver w multibyte chars', function(t) {
    receiver(function(recv) {
        var config = [{
            url: 'http://' + recv.server.address().address + ':' + recv.port + '/'
        }];
        var handler = webhookDemux(config);
        t.ok(handler, 'creates handler');
        var server = http.createServer(handler);
        server.listen(0);
        server.on('listening', function() {
            var req = send(JSON.stringify(poem), server.address().port, 'PUT');
            setTimeout(function() {
                t.deepEqual(recv.received, [poem], 'got poem');
                recv.server.close(function() {
                    server.close(function() {
                        t.end();
                    });
                });
            }, 100);
        });
    });
});

test('webhook-demux receiver w INVALID', function(t) {
    receiver(function(recv) {
        var config = [{
            url: 'http://' + recv.server.address().address + ':' + recv.port + '/'
        }];
        var handler = webhookDemux(config);
        t.ok(handler, 'creates handler');
        var server = http.createServer(handler);
        server.listen(0);
        server.on('listening', function() {
            var req = send('invalid', server.address().port, 'PUT');
            setTimeout(function() {
                t.deepEqual(recv.received, [], 'got nothing');
                recv.server.close(function() {
                    server.close(function() {
                        t.end();
                    });
                });
            }, 100);
        });
    });
});

test('webhook-demux receiver w GET', function(t) {
    receiver(function(recv) {
        var config = [{
            url: 'http://' + recv.server.address().address + ':' + recv.port + '/'
        }];
        var handler = webhookDemux(config);
        t.ok(handler, 'creates handler');
        var server = http.createServer(handler);
        server.listen(0);
        server.on('listening', function() {
            var req = send('invalid', server.address().port, 'GET');
            setTimeout(function() {
                t.deepEqual(recv.received, [], 'got nothing');
                recv.server.close(function() {
                    server.close(function() {
                        t.end();
                    });
                });
            }, 100);
        });
    });
});

test('webhook-demux simple config', function(t) {
    var config = [{ url: 'http://localhost:5000' }];
    var handler = webhookDemux(config);
    t.end();
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
