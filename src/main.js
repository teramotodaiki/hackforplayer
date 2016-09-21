const Player = require('./Player');
const stayBottom = require('./stayBottom');
const Element = require('./createElementWithEvent');
const partial = require('../templates/');
const DomInterface = require('./DomInterface');
const FrameResizer = require('./FrameResizer');
require('whatwg-fetch');

require('../scss/main.scss');

const init = ({ urls = {}, models = {} } = {}) => {
  document.body.appendChild(Player.rootElement);
  const selectors = require('./selectors');
  const containers = document.querySelectorAll(selectors.container);

  const players =
    Array.prototype.slice.call(containers)
    .map(container => {
      // An instance of h4p.Player
      const player = new Player();
      player.urls = Object.assign({}, player.urls, urls);

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
        frame.parentNode.classList.add(CSS_PREFIX + 'frame_container-undock');
        player.show('screen');

        const resized = ({width, height}) => player.emit('screen.resize', {frame, width, height});
        child.get('size').then(resized);
        child.on('resize', resized);
      });

      // eval them
      player.on('editor.run', function ({child}, files) {
        player.restart('screen', {files});
      });

      player.on('editor.load', ({child}) => {
        child.on('run', (files) => player.emit('editor.run', {child}, files));
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
          size: { width: innerWidth / 2, height: innerHeight / 2 }
        };

        player.on('editor.load', ({ child }) => {
          const resizer = new FrameResizer(child.frame, view);
          child.on('render', (view) => view.align && resizer.setAlign(view.align));
          player.once('editor.beforeunload', () => resizer.destroy());
        });

        player.start('screen', Object.assign({}, { files }, models.screen));
        player.start('editor', Object.assign({}, { files, view }, models.editor));

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
