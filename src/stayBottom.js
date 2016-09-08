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
  const frameStyle = getComputedStyle(frame);
  const offset = {
    x: frameStyle.position === 'absolute' ? pageXOffset : 0,
    y: frameStyle.position === 'absolute' ? pageYOffset : 0,
  };
  const contentSize = { width, height };

  const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
  if (ratio(screenRect) > ratio(contentSize)) {
    frame.width = screenRect.width;
    frame.height = screenRect.width * ratio(contentSize);
    frame.style.width = screenRect.width + 'px';
    frame.style.height = screenRect.width * ratio(contentSize) + 'px';
    frame.style.left = screenRect.left + offset.x + 'px';
    frame.style.top = screenRect.top + (screenRect.height - frame.height) + offset.y + 'px';
  } else {
    frame.width = screenRect.height / ratio(contentSize);
    frame.height = screenRect.height;
    frame.style.width = screenRect.height / ratio(contentSize) + 'px';
    frame.style.height = screenRect.height + 'px';
    frame.style.left = screenRect.left + (screenRect.width - frame.width) / 2 + offset.x + 'px';
    frame.style.top = screenRect.top + offset.y + 'px';
  }
};
