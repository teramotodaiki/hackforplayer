const CodeMirror = require('codemirror');
require('codemirror/mode/javascript/javascript');
require("codemirror/lib/codemirror.css");

const initPosition = require('./initPosition');

module.exports = () => {

  const cm = CodeMirror((element) => {
    initPosition(element, 'top left');
    element.style['z-index'] = '100';
    document.body.appendChild(element);
  }, {
    lineNumbers: true,
    mode: 'javascript'
  });

  return cm;
};
