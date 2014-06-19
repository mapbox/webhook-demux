var http = require('http'),
    concat = require('concat-stream');

module.exports = function(callback) {
    var received = [];

    var server = http.createServer(function(req, res) {
        req.pipe(concat(function(data) {
            received.push(JSON.parse(data));
        }));
        res.writeHead(200);
        res.end();
    });

    server.listen(0);

    server.on('listening', function() {
        return callback({
            port: server.address().port,
            server: server,
            received: received
        });
    });
};
