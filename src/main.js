const Hogan = require('hogan.js');
const copyright = require('../templates/').copyright;

console.log(copyright.render({ year: 2016 }));
console.log('Hey! I am hackforplayer!');
