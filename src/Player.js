const EventEmitter2 = require('eventemitter2');
const Postmate = require('postmate/build/postmate.min');
Postmate.debug = true;

const getFrameContainer = require('./getFrameContainer');

class Player extends EventEmitter2 {

  constructor() {
    super();

    this.lastModels = {};
    this.urls = {
      // screen: 'https://embed.hackforplay.xyz/open-source/game/alpha1.2.html'
      screen: 'http://localhost:3000/game.html',
      editor: 'http://localhost:3001/editor.html'
    };
    this.promises = {};
    this.refs = {};

  }

  start(namespace, model) {
    const prevent = this.promises[namespace] || Promise.resolve();
    this.promises[namespace] =
    prevent
      .then(() => {
        this.emit(namespace + '.beforeunload'); // call beforeunload
        this.lastModels[namespace] = model;
        return new Postmate({
          container: getFrameContainer(),
          url: this.urls[namespace],
          model
        });
      })
      .then(child => {
        this.once(namespace + '.beforeunload', () => child.destroy()); // set beforeunload
        child.frame.classList.add(CSS_PREFIX + 'frame_' + namespace);
        this.refs[namespace] = child;
        this.emit(namespace + '.load', {child});
        return child;
      });
    return this.promises[namespace];
  }

  restart(namespace, modelUpdated = {}) {
    return this.start(namespace, Object.assign({}, this.lastModels[namespace], modelUpdated));
  }

  show(namespace) { this.classListOperation(namespace, 'add', 'show'); }
  hide(namespace) { this.classListOperation(namespace, 'remove', 'show'); }
  toggle(namespace) { this.classListOperation(namespace, 'toggle', 'show'); }

  classListOperation(namespace, method, state) {
    const child = this.refs[namespace];
    if (!child) return;
    child.frame.classList[method](CSS_PREFIX + 'frame-' + state);
  }

}

module.exports = Player;
