const EventEmitter2 = require('eventemitter2');
const Postmate = require('postmate/build/postmate.min');
Postmate.debug = process.env.NODE_ENV !== 'production';

const getClassName = (componentName) => CSS_PREFIX + 'frame_container-' + componentName;

class Player extends EventEmitter2 {

  constructor() {
    super();

    this.lastModels = {};
    this.urls = {
      screen: 'https://embed.hackforplay.xyz/open-source/screen/alpha-3.html',
      editor: 'https://embed.hackforplay.xyz/open-source/editor/alpha-4.html'
    };
    this.promises = {};
    this.refs = {};
    this.containers = {};

  }

  start(namespace, model) {
    const prevent = this.promises[namespace] || Promise.resolve();
    const container = this.createContainer(namespace);

    this.promises[namespace] =
    prevent
      .then(() => {
        this.emit(namespace + '.beforeunload'); // call beforeunload
        this.lastModels[namespace] = model;
        return new Postmate({
          container,
          url: this.urls[namespace],
          model
        });
      })
      .then(child => {
        this.refs[namespace] = child;
        this.emit(namespace + '.load', {child});
        return child;
      });
    return this.promises[namespace];
  }

  restart(namespace, modelUpdated = {}) {
    return this.start(namespace, Object.assign({}, this.lastModels[namespace], modelUpdated));
  }

  destroy(namespace) {
    const container = this.containers[namespace];
    if (!container || !container.parentNode) return;
    container.parentNode.removeChild(container);
  }

  createContainer(namespace) {
    this.destroy(namespace);
    const container = document.createElement('div');
    container.classList.add(getClassName(namespace));
    Player.rootElement.appendChild(container);

    return this.containers[namespace] = container;
  }

  show(namespace) { this.classListOperation(namespace, 'add', 'show'); }
  hide(namespace) { this.classListOperation(namespace, 'remove', 'show'); }
  toggle(namespace) { this.classListOperation(namespace, 'toggle', 'show'); }

  classListOperation(namespace, method, state) {
    const child = this.refs[namespace];
    if (!child) return;
    child.frame.parentNode.classList[method](CSS_PREFIX + 'frame_container-' + state);
  }

}

Player.rootElement = document.createElement('div');
Player.rootElement.classList.add(getClassName('container'));

module.exports = Player;
