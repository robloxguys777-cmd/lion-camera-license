const { spawn } = require('child_process');

spawn('node', ['bot/index.js'], { stdio: 'inherit' });
spawn('node', ['api/index.js'], { stdio: 'inherit' });
