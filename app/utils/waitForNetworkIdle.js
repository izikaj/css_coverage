function waitForNetworkIdle(page, timeout, maxInflightRequests = 0) {
  page.on('request', onRequestStarted);
  page.on('requestfinished', onRequestFinished);
  page.on('requestfailed', onRequestFinished);

  let inflight = 0;
  let fulfill;
  let promise = new Promise(x => fulfill = x);
  let timeoutId = setTimeout(onTimeoutDone, timeout);
  let maxTimeoutId = setTimeout(onTimeoutDone, 30000);
  const $pending = {};
  return promise;

  function onTimeoutDone() {
    page.off('request', onRequestStarted);
    page.off('requestfinished', onRequestFinished);
    page.off('requestfailed', onRequestFinished);
    if (timeoutId) clearTimeout(timeoutId);
    clearTimeout(maxTimeoutId);
    fulfill();
  }

  function onRequestStarted(req) {
    $pending[req.url()] = true;
    inflight = Object.keys($pending).length;
    if (inflight > maxInflightRequests) clearTimeout(timeoutId);
  }

  function onRequestFinished(req) {
    setTimeout(() => {
      delete($pending[req.url()]);
      inflight = Object.keys($pending).length;
      if (inflight !== maxInflightRequests) return;

      timeoutId = setTimeout(onTimeoutDone, timeout);
    }, 1);
  }
}

module.exports = waitForNetworkIdle;
