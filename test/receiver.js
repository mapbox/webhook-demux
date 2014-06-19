var http = require('http'),
    concat = require('concat-stream');

module.exports = function(t, expected, callback, done) {
    var server = http.createServer(function(req, res) {
        if (!expected.length) {
            t.fail('did not expect more replies');
        }
        var expect = expected.shift();
        req.pipe(concat(function(data) {
            t.deepEqual(JSON.parse(data), expect, 'json body of webhook is correct');
        }));
        res.writeHead(200);
        res.end();
        if (!expected.length) {
            server.close(function() {
                done();
            });
        }
    });

    server.listen(0);

    server.on('listening', function() {
        console.log('receiver on ', server.address().port);
        callback(server.address().port);
    });
};
