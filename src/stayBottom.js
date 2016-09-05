module.exports =
(iframe) =>
  (event) => {
    const screenRect = event.screenRect;
    const contentSize = event.contentSize;

    const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
    if (ratio(screenRect) > ratio(contentSize)) {
      iframe.width = screenRect.width;
      iframe.height = screenRect.width * ratio(contentSize);
      iframe.style.left = screenRect.left + 'px';
      iframe.style.top = screenRect.top + (screenRect.height - iframe.height) + 'px';
    } else {
      iframe.width = screenRect.height / ratio(contentSize);
      iframe.height = screenRect.height;
      iframe.style.left = screenRect.left + (screenRect.width - iframe.width) / 2 + 'px';
      iframe.style.top = screenRect.top + 'px';
    }
  };
