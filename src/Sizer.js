const on = require('./keyEvent')('h4p').on;

module.exports = (props) => Object.assign({}, props, {
  onDragEnd: props.onDragEnd ? on(props.onDragEnd) : null
});
