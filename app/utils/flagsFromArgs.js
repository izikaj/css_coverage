const isFlag = require('./isFlag');

const flagKey = (arg) => {
  const parts = arg.replace(/^-+/, '').split('-');
  for (let index = 1; index < parts.length; index++) {
    const part = parts[index]
    parts[index] = part[0].toUpperCase() + part.slice(1, part.length);
  }
  return parts.join('');
};

function flagsFromArgs() {
  const args = process.argv.slice(2, process.argv.length);
  const result = {};

  for (let index = 0; index < args.length; index++) {
    const curr = args[index];
    const next = args[index + 1];
    if (!isFlag(curr)) {
      continue;
    }

    let key, value;
    if (/\S+=\S+/.test(curr)) {
      [key, value] = curr.split('=');
    } else {
      key = curr;
      value = ((typeof(next) === 'undefined') || isFlag(next)) ? true : next;
    }
    key = flagKey(key);

    const prev = result[key];
    if (typeof prev !== 'undefined') {
      if (Array.isArray(prev)) {
        prev.push(value);
        value = prev;
      } else {
        value = [prev, value];
      }
    }

    result[key] = value;
  }
  return result;
}

module.exports = flagsFromArgs;
