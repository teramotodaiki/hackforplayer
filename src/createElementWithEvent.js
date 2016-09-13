const on = require('./keyEvent')(EXPORT_VAR_NAME).on;
const Map = require('immutable').Map;

module.exports = (props) =>
  new Map(props)
  .map(value => typeof value === 'function' ? on(value) : value)
  .set('uid', Math.random())
  .toJS();
