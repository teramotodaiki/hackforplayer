var parentNode = null;
module.exports = () => {
  if (!parentNode) {
    parentNode = document.createElement('div');
    initStyle(parentNode);
    document.body.appendChild(parentNode);
  }

  const iframe = document.createElement('iframe');
  initStyle(iframe);
  parentNode.appendChild(iframe);

  return iframe;
};

function initStyle(node) {
  node.style.position = 'absolute';
  node.style.left = '0px';
  node.style.top = '0px';
  node.style.margin = '0px';
  node.style.padding = '0px';
  node.style.border = '0 none';
}
