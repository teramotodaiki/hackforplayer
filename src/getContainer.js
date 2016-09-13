var container;

module.exports = () => {
  if (!container) {
    container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0px';
    container.style.left = '0px';
    container.style.padding = '0px';
    container.style.margin = '0px';
    document.body.appendChild(container);
  }
  return container;
};
