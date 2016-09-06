const Player = require('./Player');
const makeIFrame = require('./makeIFrame');
const makeEditor = require('./makeEditor');
const stayBottom = require('./stayBottom');
const Button = require('./Button');

const src = 'http://localhost:3000/index.html';

const init = (namespace) => {
  const selectors = require('./selectors')(namespace);
  const containers = document.querySelectorAll(selectors.container);

  const players =
    Array.prototype.slice.call(containers)
    .map(container => {
      // An iframe element as a sigleton
      const iframe = makeIFrame();

      // An editor instance as a singleton
      const editor = makeEditor();

      // Inline script
      const query = container.getAttribute('data-target');
      const code = query && document.querySelector(query).textContent;

      editor.setValue(code.replace(/\n    /g, '\n').substr(1));

      // Initializer
      const init = () => {
        iframe.contentWindow.location.assign(src);
        return player
          .connect(iframe.contentWindow)
          .then(() => {
            player.start([], code);
          });
      };

      // An instance of h4p.Player
      const player = new Player({container, namespace});
      player.setRenderProps({
        // examples
        buttons: [
          Button({ label: 'HACK', onClick: (event) => console.log(event, 'Hack!!', this) }),
          Button({ label: 'RELOAD', onClick: () => init() })
        ]
      });

      // Always contains in screen and stay bottom
      player.addEventListener('screen.resize', stayBottom(iframe));
      player.addEventListener('editor.resize', (event) => {
        const editorElement = editor.display.wrapper;
        const editorRect = event.editorRect;
        editorElement.style.top = editorRect.top + 'px';
        editorElement.style.left = editorRect.left + 'px';
        editor.setSize(editorRect.width, editorRect.height);
      });

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
