const on = require('./keyEvent')('h4p').on;

module.exports = (props) => Object.assign({}, props, {
  onClick: props.onClick ? on(props.onClick) : null
});
