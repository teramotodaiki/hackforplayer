const EventTarget = require('event-target-shim');
const erd = require('element-resize-detector')({
  strategy: "scroll" //<- For ultra performance.
});

const selectors = require('./selectors');
const content = require('../templates/').content;


const src = 'http://localhost:3000/index.html';

class H4Player extends EventTarget {

  constructor(element) {
    super();

    const props = { src };
    element.innerHTML = content.render(props);
    this.screen = element.querySelector(selectors.screen);
    this.iframe = this.screen.querySelector(selectors.iframe);

    this.port = null;

    var width = 300, height = 150;
    this.getContentSize = () => ({ width, height });
    this.addEventListener('resize.message', (event) => {
      width = event.data.width;
      height = event.data.height;
      this.dispatchEvent(new Event('resize'));
    });
    erd.listenTo(this.screen, () => this.dispatchEvent(new Event('resize')));
    this._onresize();
    this.addEventListener('resize', this._onresize);

    this.standBy();
  }

  standBy() {
    addEventListener('message', (event) => {
      if (event.source !== this.iframe.contentWindow) return;
      this.port = event.ports[0];
      this.port.onmessage = (event) => {
        this.dispatchEvent(event);
        if (event.data.method) {
          const partialEvent = new Event(event.data.method + '.message');
          partialEvent.data = event.data;
          this.dispatchEvent(partialEvent);
        }
      };
      this.dispatchEvent(new Event('connect'));
    });
  }

  postMessage(...args) {
    if (this.port) {
      this.port.postMessage(...args);
    } else {
      this.iframe.contentWindow.postMessage
        .apply(this.iframe.contentWindow, args.length === 1 ? args.concat('*') : args);
    }
  }

  _onresize() {
    const getSize = (element) => {
      const style = getComputedStyle(element);
      const getStyle = (name) => parseInt(style.getPropertyValue(name), 10);
      return { width: getStyle('width'), height: getStyle('height') };
    };

    const contentSize = this.getContentSize();
    const screenSize = getSize(this.screen);

    const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
    if (ratio(screenSize) > ratio(contentSize)) {
      this.iframe.width = screenSize.width;
      this.iframe.height = screenSize.width * ratio(contentSize);
    } else {
      this.iframe.width = screenSize.height / ratio(contentSize);
      this.iframe.height = screenSize.height;
    }

  }

}

module.exports = H4Player;
