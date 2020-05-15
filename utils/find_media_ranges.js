function findMediaRanges(content) {
  const sanitizeRegex = /\{[^\{\}]*?\}/mg
  const mediaRegex = /(@media.*?\{)(.*?)(\})/mg
  const ranges = []

  content = content.replace(sanitizeRegex, (s) => new Array(s.length + 1).join('_'))
  let match;
  while (match = mediaRegex.exec(content)) {
    const start = match.index
    const end = start + match[1].length
    const start2 = end + match[2].length
    const end2 = start + match[0].length
    ranges.push(
      { start, end },
      { start: start2, end: end2 }
    );
  }
  return ranges;
}

module.exports = findMediaRanges;
