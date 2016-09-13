const EventTarget = require('event-target-shim');
const Postmate = require('postmate/build/postmate.min');
Postmate.debug = true;

class Player extends EventTarget {

  constructor() {
    super();

    this.lastModels = {};
    this.urls = {
      // screen: 'https://embed.hackforplay.xyz/open-source/game/alpha1.2.html'
      screen: 'http://localhost:3000/game.html'
    };

    this.addEventListener('beforeunload', (event) => event.child.destroy());
  }

  start(namespace, model) {
    this._start();
    this.lastModels[namespace] = model;
    return new Postmate({
      container: document.body,
      url: this.urls[namespace],
      model
    })
    .then(child => {
      this._start = () => this.dispatchBeforeUnloadEvent({child});
      child.get('size')
        .then(data => this.dispatchResizeEvent({data, child}));
      child.on('resize', (data) => this.dispatchResizeEvent({data, child}));

      this.dispatchLoadEvent({child});
      return child;
    });
  }
  _start() {}

  restart(namespace, modelUpdated = {}) {
    return this.start(namespace, Object.assign({}, this.lastModels[namespace], modelUpdated));
  }

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

}

module.exports = Player;
