var tty = require('tty');
tty.setRawMode(true);
process.stdin.resume();
process.stdin.on('keypress', function(char, key) {
  if (key && key.ctrl && key.name == 'c') {
    console.log('graceful exit');
    process.exit()
  }
});
