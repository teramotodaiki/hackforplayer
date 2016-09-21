module.exports = (dom) => {

  var _frame, _width, _height;

  return ({frame, width, height}) => {
    _frame = typeof frame === 'undefined' ? _frame : frame;
    _width = typeof width === 'undefined' ? _width : width;
    _height = typeof height === 'undefined' ? _height : height;

    resizeHandler(dom, _frame, _width, _height);
  };

};

function resizeHandler(dom, frame, width, height) {
  if (!dom.refs.screen || !frame) return;
  const screenRect = dom.refs.screen.getBoundingClientRect();

  frame.width = width;
  frame.height = height;

  const translate = {
    x: screenRect.left + screenRect.width / 2 - width / 2 + pageXOffset,
    y: screenRect.top + screenRect.height / 2 - height / 2 + pageYOffset
  };

  const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
  const scale = ratio(screenRect) > ratio({ width, height }) ?
    screenRect.width / width : screenRect.height / height;

  frame.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;

};
