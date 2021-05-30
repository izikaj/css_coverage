const debugCSS = (content, index, gap = 100) => {
  const start = (index < gap) ? 0 : (index - gap);
  const end = (content.length < (index + gap)) ? content.length : (index + gap);
  return content.slice(start, end);
}

function findNestedRuleRanges(content) {
  const ranges = [];

  let mediaLevel = 0;
  let waitMediaStart = false;
  let inRule = false;
  let mediaOpenStart = null;

  for (let index = 0; index < content.length; index++) {
    const sym = content[index];

    switch (sym) {
      case '@':
        mediaOpenStart = index;
        waitMediaStart = true;
        continue;

      case '{':
        if (waitMediaStart) {
          waitMediaStart = false;
          mediaLevel += 1;
          ranges.push({ start: mediaOpenStart, end: index + 1 });
          // console.log(`<<< M HEAD [${content.slice(mediaOpenStart, index + 1)}]`);
          mediaOpenStart = null;
          continue;
        }

        if (inRule) {
          console.warn(`WTF? at ${index} open bracket in rule???\n${debugCSS(content, index)}`);
        }

        inRule = true;
        continue;

      case '}':
        if (waitMediaStart) {
          console.warn(`WTF? at ${index} close bracket at media???\n${debugCSS(content, index)}`);
          continue;
        }

        if (inRule) {
          inRule = false;
          continue;
        }

        mediaLevel -= 1;
        ranges.push({ start: index, end: index + 1 });
        // console.log(`<<< M TAIL [${content.slice(index, index + 1)}]`);
        if (mediaLevel < 0) {
          console.warn(`WTF? at ${index} media level less than 0???\n${debugCSS(content, index)}`);
        }
        continue;
      case ';':
        if (waitMediaStart) {
          waitMediaStart = false;
          ranges.push({ start: mediaOpenStart, end: index + 1 });
          // console.log(`<<< M LINE [${content.slice(mediaOpenStart, index + 1)}]`);
          mediaOpenStart = null;
          continue;
        }
        continue;
    }
  }

  return ranges;
}

module.exports = findNestedRuleRanges;
