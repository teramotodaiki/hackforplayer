const EventTarget = require('event-target-shim');
const erd = require('element-resize-detector')({
  strategy: "scroll" //<- For ultra performance.
});

const getElementRect = require('./getElementRect');
const content = require('../templates/').content;

class Player extends EventTarget {

  constructor(props) {
    super();

    this.container = props.container;
    this.selectors = require('./selectors')(props.namespace);

    this._dispatchResizeEvent = this._dispatchResizeEvent.bind(this);

    var width = 300, height = 150;
    this.getContentSize = () => ({ width, height });
    this.addEventListener('resize.message', () => {
      width = event.data.width;
      height = event.data.height;
      this._dispatchResizeEvent();
    });

    // cannot access port directly
    var port = null;
    this.setPort = (value) => {
      port = this._setPort(value, port);
    };

    this.addEventListener('render', this._onrender);
    this.addEventListener('resize', this._onresize);
  }

  renderSync(props) {
    this.dispatchEvent(new Event('beforerender'));
    this.container.innerHTML = content.render(props);
    this.dispatchEvent(new Event('render'));
  }

  render(props) {
    return new Promise((resolve, reject) => {
      this.renderSync(props);
      resolve();
    });
  }

  standBy(contentWindow) {
    return new Promise((resolve, reject) => {
      addEventListener('message', function task(event) {
        if (event.source !== contentWindow) return;
        removeEventListener('message', task);
        resolve(event);
      });
    });
  }

  connect(contentWindow) {
    return new Promise((resolve, reject) => {

      // TODO: Request to reload if connected

      this.standBy(contentWindow)
      .then((event) => {
        this.setPort(event.ports[0]);
        resolve();
      });
    });
  }

  postMessage() {
    throw new Error('Missing a port. It has not connected yet.');
  }

  start(dependencies = [], code = '') {
    this.postMessage({
      method: 'require',
      dependencies,
      code,
    });
  }

  _onrender() {
    const screen = this.container.querySelector(this.selectors.screen);
    if (!screen) return;

    erd.listenTo(screen, this._dispatchResizeEvent);
    this.addEventListener('beforerender', () => erd.uninstall(screen));
  }

  _dispatchResizeEvent() {
    const screen = this.container.querySelector(this.selectors.screen);
    if (!screen) return;

    const event = new Event('resize');
    event.screenRect = getElementRect(screen);
    event.contentSize = this.getContentSize();
    this.dispatchEvent(event);
  }

  _setPort(next, current) {
    if (current) {
      current.onmessage = null;
    }
    next.onmessage = (event) => {
      this.dispatchEvent(event);
      if (event.data.method) {
        const partialEvent = new Event(event.data.method + '.message');
        partialEvent.data = event.data;
        this.dispatchEvent(partialEvent);
      }
    };
    this.postMessage = (...args) => {
      next.postMessage(...args);
    };
    return next;
  }
}

module.exports = Player;
