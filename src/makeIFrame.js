const initPosition = require('./initPosition');

module.exports = () => {
  const iframe = document.createElement('iframe');
  initPosition(iframe, 'top left');
  document.body.appendChild(iframe);
  return iframe;
};
