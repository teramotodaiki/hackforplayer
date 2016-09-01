const Hogan = require('hogan.js');

module.exports = {
  content: new Hogan.Template(require('../hogan-loader!./content.html')),
  copyright: new Hogan.Template(require('../hogan-loader!./copyright.html'))
};
