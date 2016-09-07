const EventTarget = require('event-target-shim');

class Player extends EventTarget {

  constructor({src, contentWindow} = {}) {
    super();

    this.src = src;
    this.contentWindow = contentWindow;

    var width = 300, height = 150;
    this.getContentSize = () => ({ width, height });
    this.addEventListener('resize.message', () => {
      width = event.data.width;
      height = event.data.height;
    });

    // cannot access port directly
    var port = null;
    this.setPort = (value) => {
      port = this._setPort(value, port);
    };
  }

  start({dependencies = [], code = ''}) {
    this.contentWindow.location.assign(this.src);
    this.lastLoaded = { dependencies, code };
    return this
      .connect(this.contentWindow)
      .then(() => {
        this.postMessage({
          method: 'require',
          dependencies,
          code,
        });
        return this;
      });
  }

  restart() {
    if (!this.lastLoaded) return;
    return this.start(this.lastLoaded);
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
