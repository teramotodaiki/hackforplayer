const EventTarget = require('event-target-shim');
const erd = require('element-resize-detector')({
  strategy: "scroll" //<- For ultra performance.
});
const raf = require('raf');

const getElementRect = require('./getElementRect');
const content = require('../templates/').content;
const button = require('../templates/').button;
const editor = require('../templates/').editor;

class Player extends EventTarget {

  constructor(props) {
    super();

    this.container = props.container;
    this.selectors = require('./selectors')(props.namespace);

    var width = 300, height = 150;
    this.getContentSize = () => ({ width, height });
    this.addEventListener('resize.message', () => {
      width = event.data.width;
      height = event.data.height;
      this._dispatchResizeEvent('screen');
    });

    // cannot access port directly
    var port = null;
    this.setPort = (value) => {
      port = this._setPort(value, port);
    };

    this.addEventListener('render', this._onrender);
    this.addEventListener('resize', this._onresize);

    var dirty = true;
    this.setRenderProps = (change) => {
      this.renderProps = Object.assign({}, this.renderProps, change);
      dirty = true;
    };
    const renderIfNeeded = () => {
      dirty = dirty && this.renderSync() || false;
      raf(renderIfNeeded);
    };
    raf(renderIfNeeded);
  }

  renderSync() {
    this.dispatchEvent(new Event('beforerender'));
    this.container.innerHTML = content.render(this.renderProps, {button, editor});
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
    const editor = this.container.querySelector(this.selectors.editor);
    if (!screen || !editor) return;

    erd.listenTo(screen, () => this._dispatchResizeEvent('screen'));
    erd.listenTo(editor, () => this._dispatchResizeEvent('editor'));
    this.addEventListener('beforerender', () => {
      erd.uninstall(screen);
      erd.uninstall(editor);
    });
  }

  _dispatchResizeEvent(partial) {
    const screen = this.container.querySelector(this.selectors.screen);
    const editor = this.container.querySelector(this.selectors.editor);
    if (!screen || !editor) return;

    const event = new Event(partial + '.resize');
    event.screenRect = getElementRect(screen);
    event.editorRect = getElementRect(editor);
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
