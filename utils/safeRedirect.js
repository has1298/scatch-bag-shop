
function backUrl(req, fallback = '/') {
  const referer = req.get('Referer');
  if (!referer) return fallback;
  try {
    const url = new URL(referer);
    if (url.host !== req.get('host')) return fallback;
    return url.pathname + url.search;
  } catch {
    return fallback;
  }
}

module.exports = backUrl;
