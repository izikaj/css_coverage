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
      switch (propertyName) {
        case 'background':
          if (/gradient/i.test(propertyValue)) {
            return propertyValue;
          }
          if (/^(#[0-9a-f]{3,8}|rgb\(.+\)|rgba\(.+\)|none|transparent)$/i.test(propertyValue)) {
            return propertyValue;
          }
          return '';

        case 'font-size':
          if (/^\d+$/.test(propertyValue)) {
            return '';
          }
          break;
      }

      return propertyValue;
    },
    property: function (rule, property) {
      // remove cursor style
      if (/^(cursor|transition|outline|background\-(image|repeat|position|size))$/.test(property.name)) {
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

const removeEmptyProperties = {
  level1: {
    property: function (rule, property) {
      if (/\.owl\-(carousel|item)/.test(rule)) {
        property.unused = true;
      }
      for (const prop of property.value) {
        if (!/^\s*$/.test(prop[1])) {
          return;
        }
      }
      property.unused = true;
    }
  }
};

const plugins = [
  removeFontFace,
  removePrefixedProperties,
  removeOwlStyles,
  removeUselessStyles,
  removeEmptyProperties,
];

function normalizeCSS(content, strong = false) {
  let params = { format, level: 1 };
  if (strong) {
    params = {
      ...params,
      plugins,
      level: 2,
    };
  }
  const minified = new CleanCSS(params).minify(content);

  return minified.styles;
}

module.exports = normalizeCSS;
