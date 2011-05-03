var sys = require('sys'),
    http = require('http');
 
server = http.createServer(function (req, res) {
    setTimeout(function () {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('not starting...');
    }, 2000);
    setTimeout(function () {
        res.end('Hello World\n');
    }, 4000);
});

server.listen(8000);

server.on('connection', function (stream) {
  console.log('someone connected!');
});
/*
console.log(util.inspect(server.listeners('connection'))); // [ [Function] ]
*/

var util = require('util');
var foo = {bar: 'foobar'};
console.log(util.inspect(foo));
console.log(util.inspect('Hello %s, this is my object: %j', 'World', foo));
 
sys.puts('Server running at http://127.0.0.1:8000/');
