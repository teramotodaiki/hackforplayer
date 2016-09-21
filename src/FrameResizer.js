const ResizerLength = 20;
const MinLength = 100;
const unit = (value) => value + (typeof value === 'number' ? 'px' : '');

class EditorResizer {

  constructor(frame, { size, align }) {
    this.frame = frame;
    this.size = size;
    this.align = align;
    this.destructors = [];

    this.resizer = document.createElement('div');
    this.resizer.classList.add(CSS_PREFIX + 'frame_resizer');
    this.frame.parentNode.classList.add(CSS_PREFIX + 'frame_container-dock_' + align);
    this.frame.parentNode.appendChild(this.resizer);
    this.destructors.push(() => this.resizer.parentNode.removeChild(this.resizer));

    this._isResizing = false;
    this.resizer.addEventListener('mousedown', () => this.startResizing());
    const endResizing = this.endResizing.bind(this);
    addEventListener('mouseup', endResizing);
    this.destructors.push(() => removeEventListener('mouseup', endResizing));

    const detectResizing = this.detectResizing.bind(this);
    addEventListener('mousemove', detectResizing);
    this.destructors.push(() => removeEventListener('mousemove', detectResizing));

    const resized = this.render.bind(this);
    resized();
    addEventListener('resize', resized);
    this.destructors.push(() => removeEventListener('resize', resized));
  }

  setWidth(width) {
    this.size.width = width;
    this.render();
  }

  setHeight(height) {
    this.size.height = height;
    this.render();
  }

  setAlign(align) {
    const list = this.frame.parentNode.classList;
    list.remove(CSS_PREFIX + 'frame_container-dock_' + this.align);
    list.add(CSS_PREFIX + 'frame_container-dock_' + align);

    this.align = align;
    this.render();
  }

  render() {
    const width = Math.max(MinLength, Math.min(innerWidth - ResizerLength, this.size.width));
    const height = Math.max(MinLength, Math.min(innerHeight - ResizerLength, this.size.height));

    switch (this.align) {
      case 'top':
      case 'bottom':
        this.frame.style.width = '100%';
        this.frame.style.height = height + 'px';
        break;
      case 'left':
      case 'right':
        this.frame.style.width = width + 'px';
        this.frame.style.height = '100%';
        break;
    }
  }

  startResizing() {
    this._isResizing = true;
    this.resizer.classList.add(CSS_PREFIX + 'frame_resizer-active');
  }

  endResizing() {
    this._isResizing = false;
    this.resizer.classList.remove(CSS_PREFIX + 'frame_resizer-active');
    this.render();
  }

  detectResizing(event) {
    const { clientX, clientY } = event;

    if (!this._isResizing) return;
    this.align === 'top'    ? this.setHeight(clientY) :
    this.align === 'right'  ? this.setWidth(innerWidth - clientX) :
    this.align === 'bottom' ? this.setHeight(innerHeight - clientY) :
                              this.setWidth(clientX);
  }

  destroy() {
    this.destructors.forEach((func) => func.call(this));
    if (this.resizer.parentNode) {
      this.resizer.parentNode.removeChild(this.resizer);
    }
  }

}


module.exports = EditorResizer;
