var container;

module.exports = () => {
  if (!container) {
    container = document.createElement('div');
    container.classList.add(CSS_PREFIX + 'frame_container');
    document.body.appendChild(container);
  }
  return container;
};
