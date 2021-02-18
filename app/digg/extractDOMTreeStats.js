const rejectUseless = (name) => {
  if (!name || name.length === 0) {
    return false;
  }

  if (/^ng\-/.test(name)) {
    return false;
  }

  if (/^data\-?/.test(name)) {
    return false;
  }

  return true;
}

function extractDOMTreeStats(root, stats = {}, child = false) {
  if (!root || root.type !== 'tag') {
    return;
  }
  const { name } = root;
  const children = root.children.map(child => extractDOMTreeStats(child, stats, true)).filter(n => !!n);
  const css = (root.attribs['class'] || '').split(/\s+/).filter(rejectUseless).join(' ');
  // if (!/^(div|p|body|a)$/.test(name)) {
  //   stats[name] = stats[name] || { count: 0 };
  //   stats[name].count++;
  // }
  if (css.length > 0) {
    const code = `.${css.replace(/\s+/g, '.')}`;
    stats[code] = stats[code] || { count: 0 };
    stats[code].count++;
  }

  if (!child) {
    return stats;
  }

  // const data = {
  //   name,
  //   ...(css.length > 0 ? { css } : {}),
  //   ...(children.length > 0 ? { children } : {}),
  // };
  // return data;
}

module.exports = extractDOMTreeStats;
