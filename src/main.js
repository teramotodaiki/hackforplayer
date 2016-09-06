const Player = require('./Player');
const makeIFrame = require('./makeIFrame');
const stayBottom = require('./stayBottom');

const src = 'http://localhost:3000/index.html';

const init = (namespace) => {
  const selectors = require('./selectors')(namespace);
  const containers = document.querySelectorAll(selectors.container);

  const players =
    Array.prototype.slice.call(containers)
    .map(container => {
      // An iframe element as a sigleton
      const iframe = makeIFrame();

      // Inline script
      const query = container.getAttribute('data-target');
      const code = query && document.querySelector(query).textContent;

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
      player.render(); // Render it and load iframe src.
      const player = new Player({container, namespace});

      // Always contains in screen and stay bottom
      player.addEventListener('resize', stayBottom(iframe));

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
