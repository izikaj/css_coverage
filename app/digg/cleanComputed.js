function cleanComputed({ stats, computed }) {
  let prevPath, prevCount;
  stats.forEach((pageStat) => {
    pageStat.lookup.forEach((path) => {
      const { count } = computed[path] || { count: null };
      if (prevPath && prevCount && prevCount === count) {
        delete (computed[prevPath]);
      }
      prevPath = path;
      prevCount = count;
    });
  });
}

module.exports = cleanComputed;
