const suffixes = {
  container: '',
  wrapper: '__wrapper',
  screen: '__screen',
  menuButtons: '__menu_buttons',
  dock: '__dock',
  sizer: '__sizer',
  editorWrapper: '__editor_wrapper',
  editorButtons: '__editor_buttons',
  editor: '__editor'
};
module.exports = (namespace = '.h4p') => {

  const selectors = {};
  Object.keys(suffixes).forEach(key => selectors[key] = namespace + suffixes[key]);
  const noDot = namespace.replace(/^\./, '');
  selectors.htmlClass = {};
  Object.keys(suffixes).forEach(key => selectors.htmlClass[key] = noDot + suffixes[key]);
  return selectors;

};
