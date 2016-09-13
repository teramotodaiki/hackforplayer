const suffixes = {
  container: 'container',
  wrapper: 'wrapper',
  screen: 'screen',
  menuButtons: 'menu_buttons',
};

const selectors = {};
Object.keys(suffixes).forEach(key => selectors[key] = '.' + CSS_PREFIX + suffixes[key]);
selectors.htmlClass = {};
Object.keys(suffixes).forEach(key => selectors.htmlClass[key] = CSS_PREFIX + suffixes[key]);

module.exports = selectors;
