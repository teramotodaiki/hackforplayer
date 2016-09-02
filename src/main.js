const H4Player = require('./H4Player');
const selectors = require('./selectors');

window.onload = () => {

  const players =
    Array.prototype.slice.call(document.querySelectorAll(selectors.container))
    .map(element => {
      const player = new H4Player(element);
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

};
