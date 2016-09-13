const Player = require('./Player');
const makeEditor = require('./makeEditor');
const stayBottom = require('./stayBottom');
const coverAll = require('./coverAll');
const Element = require('./createElementWithEvent');
const partial = require('../templates/');
const initPosition = require('./initPosition');

const erd = require('element-resize-detector')({
  strategy: "scroll" //<- For ultra performance.
});


const DomInterface = require('./DomInterface');

require('../scss/main.scss');

const init = (namespace, models = {}) => {
  const selectors = require('./selectors')(namespace);
  const containers = document.querySelectorAll(selectors.container);

  const players =
    Array.prototype.slice.call(containers)
    .map(container => {
      // An instance of h4p.Player
      const player = new Player();

      // An editor instance as a singleton
      const editor = makeEditor();

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
        const current = dom.dock.visibility;
        const visibility = current === 'visible' ? 'hidden' : 'visible';
        dom.dock = Object.assign({}, dom.dock, {visibility});
      };

      const fileOpen = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = ({target:{result}}) => {
          player.restart('screen', { files: [{ name: file.name, code: result }] });
          editor.setValue(result);
          event.target.value = ''; // Can upload same file
        };
        reader.readAsText(file);
      };

      dom.menuButtons = [
        Element({ label: 'HACK', onClick: toggleDock }),
        Element({ label: 'RELOAD', onClick: () => player.restart('screen') }),
        Element({ label: 'OPEN', input: {type: 'file', accept: 'text/javascript'}, onChange: fileOpen })
      ];

      const run = () => {
        const code = editor.getValue();
        player.restart('screen', { files: [{ name: 'main', code }] });
      };
      const alignDock = (align) =>
        () => dom.dock = Object.assign({}, dom.dock, {
          align,
          width: align === 'top' || align === 'bottom' ? '100vw' : '50vw',
          height: align === 'left' || align === 'right' ? '100vh' : '50vh'
        });
      const fileSave = (event) => {
        const code = editor.getValue();
        event.target.href = URL.createObjectURL(new Blob([code]));
      };
      const fileLoad = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = ({target:{result}}) => {
          editor.setValue(result);
          event.target.value = ''; // Can upload same file
        };
        reader.readAsText(file);
      };
      dom.editorButtons = [
        Element({ label: 'RUN', onClick: run }),
        Element({ label: 'SAVE', a: {download: 'main.js'}, onClick: fileSave }),
        Element({ label: 'LOAD', input: {type: 'file', accept: 'text/javascript'}, onChange: fileLoad }),
        Element({ label: 'L', onClick: alignDock('left') }),
        Element({ label: 'T', onClick: alignDock('top') }),
        Element({ label: 'B', onClick: alignDock('bottom') }),
        Element({ label: 'R', onClick: alignDock('right') }),
        Element({ label: 'HIDE', onClick: toggleDock })
      ];
      editor.setOption('extraKeys', {
  			'Ctrl-Enter': run
      });

      // Inline script
      const query = container.getAttribute('data-target');
      const code = query && document.querySelector(query).textContent;

      editor.setValue(code.replace(/\n    /g, '\n').substr(1));

      const resizeTask = stayBottom(dom);
      dom.addEventListener('screen.resize', resizeTask);
      player.on('screen.resize', resizeTask);
      dom.addEventListener('editor.resize', coverAll({dom, editor, element: editor.display.wrapper}));

      player.on('screen.load', ({child}) => {
        const frame = child.frame;
        initPosition(frame);
        frame.style.position = 'absolute';

        const resized = ({width, height}) => player.emit('screen.resize', {frame, width, height});
        child.get('size').then(resized);
        child.on('resize', resized);
      });

      // Default
      const files = [{
        name: 'main',
        code
      }];

      player.start('screen', Object.assign({}, {files}, models.screen));

      return player;
    });

  return players;
};
// export global
window.h4p = (...args) =>
  new Promise((resolve, reject) => {
    document.readyState === 'complete' ?
      resolve(init(...args)) :
      addEventListener('load', () => {
        return resolve(init(...args));
      });
  });

h4p.Player = Player;
h4p.trigger = require('./keyEvent')('h4p').trigger;
