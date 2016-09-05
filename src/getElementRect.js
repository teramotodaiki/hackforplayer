module.exports = (element) => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top + pageYOffset,
    right: rect.right + pageXOffset,
    bottom: rect.bottom + pageYOffset,
    left: rect.left + pageXOffset
  };
};
