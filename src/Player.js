const EventEmitter2 = require('eventemitter2');
const Postmate = require('postmate/build/postmate.min');
Postmate.debug = true;

class Player extends EventEmitter2 {

  constructor() {
    super();

    this.lastModels = {};
    this.urls = {
      // screen: 'https://embed.hackforplay.xyz/open-source/game/alpha1.2.html'
      screen: 'http://localhost:3000/game.html'
    };

    this.on('beforeunload', (event) => event.child.destroy());
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
      this._start = () => this.emit('beforeunload', {child});
      this.emit('load', {child});
      return child;
    });
  }
  _start() {}

  restart(namespace, modelUpdated = {}) {
    return this.start(namespace, Object.assign({}, this.lastModels[namespace], modelUpdated));
  }

}

module.exports = Player;
