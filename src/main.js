const Player = require('./Player');
const makeIFrame = require('./makeIFrame');
const makeEditor = require('./makeEditor');
const stayBottom = require('./stayBottom');
const coverAll = require('./coverAll');
const Button = require('./Button');
const Sizer = require('./Sizer');
const partial = require('../templates/');

const erd = require('element-resize-detector')({
  strategy: "scroll" //<- For ultra performance.
});


const DomInterface = require('./DomInterface');

require('../scss/main.scss');

const src = 'http://localhost:3000/index.html';

const init = (namespace) => {
  const selectors = require('./selectors')(namespace);
  const containers = document.querySelectorAll(selectors.container);

  const players =
    Array.prototype.slice.call(containers)
    .map(container => {
      // An iframe element as a sigleton
      const iframe = makeIFrame();
      const contentWindow = iframe.contentWindow;

      // An instance of h4p.Player
      const player = new Player({src, contentWindow});

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
        sizer: Sizer({ onDragEnd: dragSizer })
      };

      const toggleDock = () => {
        const current = dom.dock.visibility;
        const visibility = current === 'visible' ? 'hidden' : 'visible';
        dom.dock = Object.assign({}, dom.dock, {visibility});
      };

      dom.menuButtons = [
        Button({ label: 'HACK', onClick: toggleDock }),
        Button({ label: 'RELOAD', onClick: () => player.restart() })
      ];

      const run = () => {
        const code = editor.getValue();
        player.start({
          dependencies: [],
          code
        });
      };
      const alignDock = (align) =>
        () => dom.dock = Object.assign({}, dom.dock, {
          align,
          width: align === 'top' || align === 'bottom' ? '100vw' : '50vw',
          height: align === 'left' || align === 'right' ? '100vh' : '50vh'
        });
      dom.editorButtons = [
        Button({ label: 'RUN', onClick: run }),
        Button({ label: 'T', onClick: alignDock('top') }),
        Button({ label: 'R', onClick: alignDock('right') }),
        Button({ label: 'B', onClick: alignDock('bottom') }),
        Button({ label: 'L', onClick: alignDock('left') })
      ];

      // Inline script
      const query = container.getAttribute('data-target');
      const code = query && document.querySelector(query).textContent;

      editor.setValue(code.replace(/\n    /g, '\n').substr(1));

      dom.addEventListener('screen.resize', stayBottom({dom, player, iframe}));
      player.addEventListener('resize.message', stayBottom({dom, player, iframe}));
      dom.addEventListener('editor.resize', coverAll({dom, editor, element: editor.display.wrapper}));

      player.start({
        dependencies: [],
        code
      });

      return player;
    });

  return players;
};
// export global
window.h4p = (...args) =>
  new Promise((resolve, reject) => {
    addEventListener('load', () => {
      return resolve(init(...args));
    });
  });

h4p.Player = Player;
h4p.makeIFrame = makeIFrame;
h4p.trigger = require('./keyEvent')('h4p').trigger;
