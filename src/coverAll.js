const getElementRect = require('./getElementRect');

module.exports = ({dom, editor, element}) =>
() => {
  if (!dom.refs.editor) return;
  const editorRect = getElementRect(dom.refs.editor);
  element.style.visibility = getComputedStyle(dom.refs.editor).visibility;
  element.style.top = editorRect.top + 'px';
  element.style.left = editorRect.left + 'px';
  editor.setSize(editorRect.width, editorRect.height);
};
