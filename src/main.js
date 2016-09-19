const Player = require('./Player');
const stayBottom = require('./stayBottom');
const Element = require('./createElementWithEvent');
const partial = require('../templates/');
const DomInterface = require('./DomInterface');
require('whatwg-fetch');

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
        Element({ label: 'HACK', onClick: () => player.toggle('editor') }),
        Element({ label: 'RELOAD', onClick: () => player.restart('screen') }),
        Element({ label: 'OPEN', input: {type: 'file', accept: 'text/javascript'}, onChange: fileOpen })
      ];

      const resizeTask = stayBottom(dom);
      dom.addEventListener('screen.resize', resizeTask);
      player.on('screen.resize', resizeTask);

      player.on('screen.load', ({child}) => {
        const frame = child.frame;
        player.show('screen');

        const resized = ({width, height}) => player.emit('screen.resize', {frame, width, height});
        child.get('size').then(resized);
        child.on('resize', resized);
      });

      // eval them
      player.on('editor.run', function ({child}, files) {
        player.restart('screen', {files});
      });

      const alignment = ({child}, view) => {
        const {x, y} = view.edge;
        switch (view.align) {
          case 'top':
            player.setRect('editor', 0, 0, '100vw', y);
            break;
          case 'right':
            player.setRect('editor', x, 0, innerWidth - x, '100vh');
            break;
          case 'left':
            player.setRect('editor', 0, 0, x, '100vh');
            break;
          case 'bottom':
            player.setRect('editor', 0, y, '100vw', innerHeight - y);
            break;
        }
      };
      player.on('editor.resize', alignment);

      player.on('editor.load', ({child}) => {
        child.on('run', (files) => player.emit('editor.run', {child}, files));
        child.on('render', (view) => player.emit('editor.resize', {child}, view));
        const resized = () => child.get('view').then((view) => alignment({child}, view));
        resized();
        addEventListener('resize', resized);
        player.once('editor.beforeunload', () => removeEventListener('resize', task));
      });


      // Default
      const elements = [].slice.call(
        document.querySelectorAll(container.getAttribute('data-target'))
      );

      const mainModuleName = container.getAttribute('data-main');
      const indent = (code) => {
        code = code.replace(/^\n*/g, '');
        const spaces = /^\s*/.exec(code)[0];
        if (spaces) {
          code = code
            .split('\n')
            .map(s => s.indexOf(spaces) ? s :  s.substr(spaces.length))
            .join('\n');
        }
        return code;
      };
      Promise.all(
        elements.map((element) => {
          const alias = element.getAttribute('alias');
          const filename = alias + '.js';
          const isEntryPoint = mainModuleName === alias;
          const src = element.getAttribute('src');

          return src ?
            fetch(src)
              .then((response) => response.text())
              .then((code) => ({ alias, filename, isEntryPoint, code })) :
            Promise.resolve({
              alias, filename, isEntryPoint,
              code: indent(element.textContent)
            });
        })
      ).then((files) => {

        const view = {
          align: 'right',
          edge: {
            x: innerWidth / 2,
            y: innerHeight / 2
          }
        };

        player.start('screen', Object.assign({}, {files}, models.screen));
        player.start('editor', Object.assign({}, {files}, view, models.editor));

      });

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
