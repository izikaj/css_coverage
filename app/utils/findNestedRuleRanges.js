function findNestedRuleRanges(content) {
  const nestedRuleRegex = /(@[\w\-]+\s*[^\;]+?)\{([^{]*|.*?\}\s*)\}/mg;
  const ranges = []

  let match;
  while (match = nestedRuleRegex.exec(content)) {
    const start = match.index
    const end = start + match[1].length + 1
    const start2 = start + match[0].length - 1
    const end2 = start + match[0].length

    // leave only media rules
    // console.log('findNestedRuleRanges', match[1], match[2].length);
    // console.log('findNestedRuleRanges - 1', content.slice(start, end));
    // console.log('findNestedRuleRanges - 2', content.slice(start2, end2));
    if (/^@(media)/.test(match[1])) {
      ranges.push(
        { start, end },
        { start: start2, end: end2 }
      );
    }
  }
  // console.log('findNestedRuleRanges RESULT', ranges);
  return ranges;
}

module.exports = findNestedRuleRanges;
