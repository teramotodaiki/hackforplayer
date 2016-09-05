var _listeners = {}, i = 0;

const trigger = (key, thisObj, event) => _listeners[key].call(thisObj, event);
module.exports = (namespace) => ({
  on: (handler) => {
    const key = '_' + ++i;
    _listeners[key] = handler;
    return `${namespace}.trigger('${key}', this, event);`;
  },
  trigger
});
