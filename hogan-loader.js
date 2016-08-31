const Hogan = require('hogan.js');

module.exports = (content) => {
  const template = Hogan.compile(content, { asString: true });
  return `module.exports = ${template}`;
};
