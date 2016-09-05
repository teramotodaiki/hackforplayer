const Player = require('./Player');
const selectors = require('./selectors');
const makeIFrame = require('./makeIFrame');

const src = 'http://localhost:3000/index.html';

const init = () => {
  const players =
    Array.prototype.slice.call(document.querySelectorAll(selectors.container))
    .map(container => {
      // An iframe element as a sigleton
      const iframe = makeIFrame();
      iframe.src = src;

      // An instance of h4p.Player
      const player = new Player(container);

      player.render() // Render it and load iframe src.
      .then(() => player.connect(iframe.contentWindow))
      .then(() => {
        const query = container.getAttribute('data-target');
        player.start([], query && document.querySelector(query).textContent);
      });

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
