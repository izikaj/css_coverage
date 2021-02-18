function codeName(...parts) {
  return parts.map(p => {
    return (p || '').toString()
      .toLowerCase()
      .replace(/https?:\/\//g, '')
      .replace(/\w+\.cloudfront\.net\//g, '')
      .replace(/\-[0-9a-f]{64}/g, '')
      .replace(/[^a-z0-9_-]+/g, '_');
  }).join('_')
    .replace(/_+/g, '_')
    .replace(/(^_|_$)/, '');
}

module.exports = codeName;
