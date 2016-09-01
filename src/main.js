const Hogan = require('hogan.js');

const content = require('../templates/').content;

const classNamePrefix = '.h4p__';
const src = 'http://localhost:3000/index.html';


window.onload = () => {

  Array.prototype.slice.call(document.querySelectorAll(classNamePrefix + 'content'))
    .map((element) => {

      const props = { src };
      element.innerHTML = content.render(props);
      return {
        contentWindow: element.querySelector(classNamePrefix + 'content__iframe').contentWindow,
        code: document.querySelector(element.getAttribute('data-target')).textContent,
      };

    })
    .forEach(({contentWindow, code}) => addEventListener('message', (event) => {

      if (event.source === contentWindow) {
        event.ports[0].postMessage({
          method: 'require',
          dependencies: [],
          code
        });
      }

    }));

};
