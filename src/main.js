const Hogan = require('hogan.js');

const content = require('../templates/').content;

const classNamePrefix = '.h4p__';
const src = 'http://localhost:3000/index.html';


window.onload = () => {

  Array.prototype.slice.call(document.querySelectorAll(classNamePrefix + 'content'))
    .map((element) => {

      const props = { src };
      element.innerHTML = content.render(props);
      return element.querySelector(classNamePrefix + 'content__iframe').contentWindow;

    })
    .forEach((contentWindow) => addEventListener('message', (event) => {

      if (event.source === contentWindow) {
        console.log(event.data); // ping
        event.ports[0].onmessage = (event) => {
          console.log(event.data); // connected!
        };
        event.ports[0].postMessage('pong');
      }

    }));

};
