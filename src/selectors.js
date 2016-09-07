const Immutable = require('immutable');

const suffixes = Immutable.Map({
  container: '',
  wrapper: '__wrapper',
  screen: '__screen',
  menuButtons: '__menu_buttons',
  dock: '__dock',
  sizer: '__sizer',
  editorWrapper: '__editor_wrapper',
  editorButtons: '__editor_buttons',
  editor: '__editor'
});
module.exports = (namespace = '.h4p') => {

  const selectors = suffixes.map((suf) => namespace + suf);
  const noDot = namespace.replace(/^\./, '');
  const add = selectors.set('htmlClasses', suffixes.map((suf) => noDot + suf));
  console.log(add.toJS());
  return add;

};
