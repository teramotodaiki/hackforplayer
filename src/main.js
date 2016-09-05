const Player = require('./Player');
const makeIFrame = require('./makeIFrame');

const src = 'http://localhost:3000/index.html';

const init = (namespace) => {
  const selectors = require('./selectors')(namespace);
  const containers = document.querySelectorAll(selectors.container);

  const players =
    Array.prototype.slice.call(containers)
    .map(container => {
      // An iframe element as a sigleton
      const iframe = makeIFrame();
      iframe.src = src;

      // An instance of h4p.Player
      const player = new Player(container, {namespace});

      player.render() // Render it and load iframe src.
      .then(() => player.connect(iframe.contentWindow))
      .then(() => {
        const query = container.getAttribute('data-target');
        player.start([], query && document.querySelector(query).textContent);
      });

      // Always contains in screen and stay bottom
      player.addEventListener('resize', (event) => {
        const screenRect = event.screenRect;
        const contentSize = event.contentSize;

        const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
        if (ratio(screenRect) > ratio(contentSize)) {
          iframe.width = screenRect.width;
          iframe.height = screenRect.width * ratio(contentSize);
          iframe.style.left = screenRect.left + 'px';
          iframe.style.top = screenRect.top + (screenRect.height - iframe.height) + 'px';
        } else {
          iframe.width = screenRect.height / ratio(contentSize);
          iframe.height = screenRect.height;
          iframe.style.left = screenRect.left + (screenRect.width - iframe.width) / 2 + 'px';
          iframe.style.top = screenRect.top + 'px';
        }
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
