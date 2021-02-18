function makeMinimalizedCommon({ similar, computed }) {
  const minimal = {};

  for (const lookup in computed) {
    const uniqPaths = [];
    const groups = [];

    const { count, paths } = computed[lookup];
    paths.forEach((path) => {
      for (const group of groups) {
        if (group.indexOf(path) !== -1) {
          return;
        }
      }
      uniqPaths.push(path);
      for (const group of similar) {
        if (group.indexOf(path) !== -1) {
          groups.push(group);
        }
      }
    });

    minimal[lookup] = {
      count: uniqPaths.length,
      paths: uniqPaths,
      totalCount: count,
    };
  }

  return minimal;
}

module.exports = makeMinimalizedCommon;
