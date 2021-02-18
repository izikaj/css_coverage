const extractDOMTreeStats = require('./extractDOMTreeStats');

function collectPageStats($) {
  $(`
    script, meta,
    p > a, p > i, p > b, p > u, p > strong, br,
    [style*="display"], p[style], [class*="ui-"]
  `).remove();
  $('*').each((_index, el) => {
    Object.keys(el.attribs).forEach((attr) => {
      if (/(^(ng|data)\-|href|action|data|method)/.test(attr)) {
        $(el).removeAttr(attr);
      }
    });
    ($(el).attr('class') || '').split(/\s+/).forEach((className) => {
      if (/(^(ng)\-)/.test(className)) {
        $(el).removeClass(className);
      }
    });
  });

  return extractDOMTreeStats($('body')[0]);
}


module.exports = collectPageStats;
