const Map = require('immutable').Map;
const List = require('immutable').List;
const erd = require('element-resize-detector')({
  strategy: "scroll" //<- For ultra performance.
});

const RendererInterface = require('./RendererInterface');

class DomInterface extends RendererInterface {
  constructor(initialState = {}) {
    super();

    this.state = new Map(initialState);

    this.observed = ['screen']; // Detect resize event

    this.refs = {};
    this.addEventListener('render', this._onrender);

    this.start();
  }

  render() {
    // This is the simplest render implement.
    if (!this.template || !this.container) return;
    this.dispatchEvent(new Event('beforerender'));
    this.container.innerHTML =
      this.template.render(this.renderProps.toJS(), this.partial);

    if (!this.selectors) return;
    this.refs = new Map(this.selectors)
      .filter(item => typeof item === 'string')
      .map(item => this.container.querySelector(item))
      .toJS();

    this.dispatchEvent(new Event('render'));
  }

  _onrender() {
    this.observed
    .map(key => ({ key, ref: this.refs[key] }))
    .forEach(item => {
      erd.listenTo(item.ref, () => this._dispatchResizeEvent(item.key));
    });
  }

  _dispatchResizeEvent(partial) {
    this.dispatchEvent(new Event(partial + '.resize'));
  }

  get container() {
    return this.state.get('container');
  }

  set container(value) {
    this.state = this.state.set('container', value);
  }

  get renderProps() {
    return this.state.get('renderProps', new Map());
  }

  set renderProps(value) {
    this.state = this.state.set('renderProps', value);
  }

  get selectors() {
    return this.state.get('selectors', {});
  }

  set selectors(value) {
    this.state = this.state.set('selectors', value);
  }

  get template() {
    return this.state.get('template');
  }

  set template(value) {
    this.state = this.state.set('template', value);
  }

  get partial() {
    return this.state.get('partial', {});
  }

  set partial(value) {
    this.state = this.state.set('partial', value);
  }

  get menuButtons() {
    return this.renderProps.get('menuButtons');
  }

  set menuButtons(value) {
    this.renderProps = this.renderProps.set('menuButtons', value);
  }

  get classNames() {
    return this.renderProps.get('classNames');
  }

  set classNames(value) {
    this.renderProps = this.renderProps.set('classNames', value);
  }
}

module.exports = DomInterface;
