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
    this.promises = {};

  }

  start(namespace, model) {
    const prevent = this.promises[namespace] || Promise.resolve();
    this.promises[namespace] =
    prevent
      .then(() => {
        this.emit(namespace + '.beforeunload'); // call beforeunload
        this.lastModels[namespace] = model;
        return new Postmate({
          container: document.body,
          url: this.urls[namespace],
          model
        });
      })
      .then(child => {
        this.once(namespace + '.beforeunload', () => child.destroy()); // set beforeunload
        this.emit(namespace + '.load', {child});
        return child;
      });
    return this.promises[namespace];
  }

  restart(namespace, modelUpdated = {}) {
    return this.start(namespace, Object.assign({}, this.lastModels[namespace], modelUpdated));
  }

}

module.exports = Player;
