const Player = require('./Player');
const selectors = require('./selectors');

const init = () => {
  const players =
    Array.prototype.slice.call(document.querySelectorAll(selectors.container))
    .map(element => {
      const player = new Player(element);
      const query = element.getAttribute('data-target');

      player.addEventListener('connect', () => {
        // Load contents
        player.postMessage({
          method: 'require',
          dependencies: [],
          code: query && document.querySelector(query).textContent,
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
