const EventTarget = require('event-target-shim');
const Postmate = require('postmate/build/postmate.min');
Postmate.debug = true;

const initPosition = require('./initPosition');

class Player extends EventTarget {

  constructor({src} = {}) {
    super();

    this.src = src;

    var width = 300, height = 150;
    this.getContentSize = () => ({ width, height });
    this.addEventListener('resize', () => {
      width = event.data.width;
      height = event.data.height;
    });

    // cannot access port directly
    var port = null;
    this.setPort = (value) => {
      port = this._setPort(value, port);
    };

    this.addEventListener('beforeunload', (event) => event.child.destroy());
  }

  start(model) {
    this._start();
    return new Postmate({
      container: document.body,
      url: this.src,
      model
    })
    .then(child => {
      this._start = () => this.dispatchBeforeUnloadEvent({child});
      this.restart = (modelUpdated) => this.start(Object.assign({}, model, modelUpdated));
      initPosition(child.frame);
      child.frame.style.position = 'absolute';
      child.get('size')
        .then(data => this.dispatchResizeEvent({data, child}));
      child.on('resize', (data) => this.dispatchResizeEvent({data, child}));

      this.dispatchLoadEvent({child});
      return child;
    });
  }
  _start() {}
  restart() {}

  dispatchResizeEvent({data, child}) {
    const event = new Event('resize');
    event.frame = child.frame;
    event.width = data.width;
    event.height = data.height;
    this.dispatchEvent(event);
  }

  dispatchBeforeUnloadEvent({child}) {
    const event = new Event('beforeunload');
    event.child = child;
    this.dispatchEvent(event);
  }

  dispatchLoadEvent({child}) {
    const event = new Event('load');
    event.child = child;
    this.dispatchEvent(event);
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
