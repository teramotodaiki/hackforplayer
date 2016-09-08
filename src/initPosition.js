module.exports = (node, fixes = 'top left') => {
  node.style.margin = '0px';
  node.style.padding = '0px';
  node.style.border = '0 none';
  fixes.split(' ').forEach((key) => node.style[key] = '0px');
};
