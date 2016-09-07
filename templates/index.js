const Hogan = require('hogan.js');

module.exports = {
  content: new Hogan.Template(require('../hogan-loader!./content.html')),
  button: new Hogan.Template(require('../hogan-loader!./button.html')),
  dock: new Hogan.Template(require('../hogan-loader!./dock.html')),
  editor: new Hogan.Template(require('../hogan-loader!./editor.html'))
};
