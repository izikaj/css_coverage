function codeName(...parts) {
  return parts.map(p => {
    return p.toString()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_');
  }).join('_')
    .replace(/_+/g, '_')
    .replace(/(^_|_$)/, '');
}

module.exports = codeName;
