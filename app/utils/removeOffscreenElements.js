async function removeOffscreenElements(page) {
  await page.evaluate(_ => {
    if (typeof(jQuery) === 'function') {
      jQuery.expr.filters.offscreen = function (el) {
        var rect = el.getBoundingClientRect();
        return (
          (rect.x + rect.width) < 0
          || (rect.y + rect.height) < 0
          || (rect.x > window.innerWidth || rect.y > window.innerHeight)
        );
      };
      $(':offscreen').remove();
    }
  });
}

module.exports = removeOffscreenElements;
