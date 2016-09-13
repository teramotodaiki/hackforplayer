const Player = require('./Player');
const makeEditor = require('./makeEditor');
const stayBottom = require('./stayBottom');
const coverAll = require('./coverAll');
const Element = require('./createElementWithEvent');
const partial = require('../templates/');
const initPosition = require('./initPosition');
const DomInterface = require('./DomInterface');

require('../scss/main.scss');

const init = (models = {}) => {
  const selectors = require('./selectors');
  const containers = document.querySelectorAll(selectors.container);

  const players =
    Array.prototype.slice.call(containers)
    .map(container => {
      // An instance of h4p.Player
      const player = new Player();

      // DOM renderer interface
      const dom = new DomInterface({
        container,
        selectors,
        template: partial.content,
        partial
      });

      dom.classNames = selectors.htmlClass;
      const dragSizer = (event) => {
        const left = (event.clientX / innerWidth * 100) >> 0;
        const top = (event.clientY / innerHeight * 100) >> 0;
        const dock = dom.dock;
        const align = dock.align;

        dom.dock = Object.assign({}, dom.dock, {
          width:
            align === 'top' || align === 'bottom' ? '100vw' :
            align === 'left' ? (left + 'vw') : (100 - left + 'vw'),
          height:
            align === 'left' || align === 'right' ? '100vh' :
            align === 'top' ? (top + 'vh') : (100 - top + 'vh')
        });
      };
      dom.dock = {
        visibility: 'hidden',
        align: 'right',
        width: '50vw',
        height: '100vh',
        sizer: Element({ onDragEnd: dragSizer })
      };

      const toggleDock = () => {
        const editor = player.refs.editor;
        if (!editor) return;
        const style = editor.frame.getCurrentStyle || getComputedStyle(editor.frame);
        editor.frame.style.visibility = style.visibility === 'hidden' ? 'visible' : 'hidden';
      };

      const fileOpen = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = ({target:{result}}) => {
          const files = [{ name: file.name, filename: file.name, code: result }];
          player.restart('screen', {files});
          player.restart('editor', {files});
          event.target.value = ''; // Can upload same file
        };
        reader.readAsText(file);
      };

      dom.menuButtons = [
        Element({ label: 'HACK', onClick: toggleDock }),
        Element({ label: 'RELOAD', onClick: () => player.restart('screen') }),
        Element({ label: 'OPEN', input: {type: 'file', accept: 'text/javascript'}, onChange: fileOpen })
      ];

      // Inline script
      const query = container.getAttribute('data-target');
      const code = query && document.querySelector(query).textContent;

      const resizeTask = stayBottom(dom);
      dom.addEventListener('screen.resize', resizeTask);
      player.on('screen.resize', resizeTask);

      player.on('screen.load', ({child}) => {
        const frame = child.frame;
        initPosition(frame);
        frame.style.position = 'absolute';

        const resized = ({width, height}) => player.emit('screen.resize', {frame, width, height});
        child.get('size').then(resized);
        child.on('resize', resized);
      });

      // eval them
      player.on('editor.run', function ({child}, files) {
        player.restart('screen', {files});
      });

      player.on('editor.resize', alignment);
      function alignment({child}, view) {
        var x = view.edge.x, y = view.edge.y;
        switch (view.align) {
          case 'top':
            setRect(0, 0, '100vw', y);
            break;
          case 'right':
            setRect(x, 0, innerWidth - x, '100vh');
            break;
          case 'left':
            setRect(0, 0, x, '100vh');
            break;
          case 'bottom':
            setRect(0, y, '100vw', innerHeight - y);
        }
        function setRect(left, top, width, height) {
          var ref = child.frame.style;
          ref.left = unit(left);
          ref.top = unit(top);
          ref.width = unit(width);
          ref.height = unit(height);
        }
        function unit(value) {
          return value + (typeof value === 'number' ? 'px' : '');
        }
      }

      player.on('editor.load', ({child}) => {
        child.on('run', (files) => player.emit('editor.run', {child}, files));
        child.get('view').then((view) => alignment({child}, view));
        child.on('render', (view) => player.emit('editor.resize', {child}, view));
        addEventListener('resize', function task () {
          child.get('view').then((view) => alignment({child}, view));
          player.once('editor.beforeunload', () => removeEventListener('resize', task));
        });
        child.frame.style.position = 'fixed';
        child.frame.style['z-index'] = 1;
        child.frame.style.border = '0 none';
        child.frame.style['box-shadow'] = 'rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px';
      });


      // Default
      const files = [{
        name: 'main',
        filename: 'main.js',
        code
      }];
      const view = {
        align: 'right',
        edge: {
          x: innerWidth / 2,
          y: innerHeight / 2
        }
      };

      player.start('screen', Object.assign({}, {files}, models.screen));
      player.start('editor', Object.assign({}, {files}, view, models.editor));

      return player;
    });

  return players;
};

const h4p = (...args) =>
  new Promise((resolve, reject) => {
    document.readyState === 'complete' ?
      resolve(init(...args)) :
      addEventListener('load', () => {
        return resolve(init(...args));
      });
  });

h4p.Player = Player;
h4p.trigger = require('./keyEvent')(EXPORT_VAR_NAME).trigger;

// export global
window[EXPORT_VAR_NAME] = h4p;
