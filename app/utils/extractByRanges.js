function extractByRanges(content, ranges = []) {
  return (
    ranges.map(range => content.slice(range.start, range.end)).join("\n")
      .replace(/(^\s+|\s+$)/g, '')
  );
}

module.exports = extractByRanges;
