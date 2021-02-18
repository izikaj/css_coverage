const CleanCSS = require('clean-css');
const { reporter } = require('csstree-validator/lib/reporter');
const format = 'beautify';

const removeFontFace = {
  level2: {
    block: function (tokens) {
      let tokenType, tokenNames, tokenValues, i, l;

      for (i = 0, l = tokens.length; i < l; i++) {
        tokenType = tokens[i][0];
        tokenNames = tokens[i][1];
        tokenValues = tokens[i][2];

        if (tokenType == 'at-rule-block' && tokenNames[0][1] == '@font-face' && tokenValues.length > 0) {
          tokens[i][2] = [];
        }
      }
    },
  }
};

const removePrefixedProperties = {
  level1: {
    property: function (_rule, property) {
      let value;
      if (/\-(webkit|ms|moz|o|khtml)\-/.test(property.name)) {
        property.unused = true;
      }

      // remove prefixed gradients
      if (/^(background|background-image$)/.test(property.name)) {
        value = property.value[0][1];
        if (/\-(webkit|ms|moz|o|khtml)\-/.test(value)) {
          property.unused = true;
        }
      }
    }
  }
};

const removeOwlStyles = {
  level1: {
    property: function (rule, property) {
      if (/\.owl\-(carousel|item)/.test(rule)) {
        property.unused = true;
      }
    }
  }
};

const removeUselessStyles = {
  level1: {
    value: function (propertyName, propertyValue) {
      if (propertyName == 'background') {
        if (/gradient/i.test(propertyValue)) {
          return propertyValue;
        }
        if (/^(#[0-9a-f]{3,8}|rgb\(.+\)|rgba\(.+\)|none|transparent)$/i.test(propertyValue)) {
          return propertyValue;
        }
        return '';
      }
      return propertyValue;
    },
    property: function (rule, property) {
      // remove cursor style
      if (/^(cursor|outline|background\-(image|repeat|position|size))$/.test(property.name)) {
        property.unused = true;
      }
      // remove select2 visibility-hidden
      if (/^(\.select2-hidden-accessible)$/.test(rule)) {
        property.unused = true;
      }
      // remove footer css
      if (/(\.footer|\.prefooter)/.test(rule)) {
        property.unused = true;
      }
    }
  }
};

const plugins = [
  removeFontFace,
  removePrefixedProperties,
  removeOwlStyles,
  removeUselessStyles,
];

function normalizeCSS(content) {
  const minified = new CleanCSS({ format, level: 2, plugins }).minify(content);

  console.warn('minify:', minified.stats);

  return minified.styles;
}

module.exports = normalizeCSS;
