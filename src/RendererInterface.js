const EventTarget = require('event-target-shim');
const raf = require('raf');

class RendererInterface extends EventTarget {
  constructor() {
    super();

    this.state = null;

    // Render if state changed
    var preventState = null;
    const renderIfNeeded = () => {
      if (preventState !== this.state) {
        this.render();
      }
      preventState = this.state;
      raf(renderIfNeeded);
    };

    this.start = () => raf(renderIfNeeded);
  }

  render() {}
}

module.exports = RendererInterface;
