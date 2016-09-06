const Hogan = require('hogan.js');

module.exports = {
  content: new Hogan.Template(require('../hogan-loader!./content.html')),
  button: new Hogan.Template(require('../hogan-loader!./button.html')),
  editor: new Hogan.Template(require('../hogan-loader!./editor.html')),
  copyright: new Hogan.Template(require('../hogan-loader!./copyright.html'))
};
