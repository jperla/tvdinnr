var sys = require('sys'),
    http = require('http');

var activities = {}
 
var server = http.createServer(function (req, res) {
    // save the session's current activity
    var query = require('url').parse(req.url, true).query;
    if (query.sessionid) {
        activities[query.sessionid] = query.activity;
        // #TODO: jperla: keep keys in order and delete
        // #TODO: jperla: push to everyone who wants it
    }
    console.log('%s: activities: %j', req.url, activities);

    res.writeHead(200);
    res.end('{"success": true}');
});

server.listen(8000);

server.on('connection', function (stream) {
  console.log('someone connected!');
});

sys.puts('Server running at http://127.0.0.1:8000/');
