const Player = require('./Player');
const makeIFrame = require('./makeIFrame');
const makeEditor = require('./makeEditor');
const stayBottom = require('./stayBottom');
const coverAll = require('./coverAll');
const Button = require('./Button');
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
      // An instance of h4p.Player
      const player = new Player();

      // An iframe element as a sigleton
      const iframe = makeIFrame();

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
      dom.dock = {
        visibility: 'visible',
        align: 'right'
      };

      const toggleDock = () => {
        const current = dom.dock.visibility;
        const visibility = current === 'visible' ? 'hidden' : 'visible';
        dom.dock = Object.assign({}, dom.dock, {visibility});
      };
      // Initializer
      const init = () => {
        iframe.contentWindow.location.assign(src);
        return player
          .connect(iframe.contentWindow)
          .then(() => {
            player.start([], code);
          });
      };
      dom.menuButtons = [
        Button({ label: 'HACK', onClick: toggleDock }),
        Button({ label: 'RELOAD', onClick: init })
      ];

      const alignDock = (align) =>
        () => dom.dock = Object.assign({}, dom.dock, {align});
      dom.editorButtons = [
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

      init();

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
