const on = require('./keyEvent')('h4p').on;
const Map = require('immutable').Map;

module.exports = (props) =>
  new Map(props)
  .map(value => typeof value === 'function' ? on(value) : value)
  .toJS();
