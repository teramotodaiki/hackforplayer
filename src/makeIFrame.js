const initPosition = require('./initPosition');

module.exports = () => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  initPosition(iframe, 'top left');
  document.body.appendChild(iframe);
  return iframe;
};
