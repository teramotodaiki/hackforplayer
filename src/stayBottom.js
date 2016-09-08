module.exports = ({dom, player, iframe}) =>
() => {
  if (!dom.refs.screen) return;
  const screenRect = dom.refs.screen.getBoundingClientRect();
  const iframeStyle = getComputedStyle(iframe);
  const offset = {
    x: iframeStyle.position === 'absolute' ? pageXOffset : 0,
    y: iframeStyle.position === 'absolute' ? pageYOffset : 0,
  };
  const contentSize = player.getContentSize();

  const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
  if (ratio(screenRect) > ratio(contentSize)) {
    iframe.width = screenRect.width;
    iframe.height = screenRect.width * ratio(contentSize);
    iframe.style.width = screenRect.width + 'px';
    iframe.style.height = screenRect.width * ratio(contentSize) + 'px';
    iframe.style.left = screenRect.left + offset.x + 'px';
    iframe.style.top = screenRect.top + (screenRect.height - iframe.height) + offset.y + 'px';
  } else {
    iframe.width = screenRect.height / ratio(contentSize);
    iframe.height = screenRect.height;
    iframe.style.width = screenRect.height / ratio(contentSize) + 'px';
    iframe.style.height = screenRect.height + 'px';
    iframe.style.left = screenRect.left + (screenRect.width - iframe.width) / 2 + offset.x + 'px';
    iframe.style.top = screenRect.top + offset.y + 'px';
  }
};
