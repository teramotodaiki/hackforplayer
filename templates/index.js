const Hogan = require('hogan.js');

module.exports = {
  copyright: new Hogan.Template(require('../hogan-loader!./copyright.html'))
};
