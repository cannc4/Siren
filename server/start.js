require('babel-core/register')({
  "presets": ["es2015"]
});

var app = require('./app');
app();