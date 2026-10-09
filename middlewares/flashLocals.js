
module.exports = function flashLocals(req, res, next) {
  const originalRender = res.render.bind(res);

  res.render = (view, options = {}, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const hasFlash = typeof req.flash === 'function';
    const locals = {
      error: hasFlash ? req.flash('error') : [],
      success: hasFlash ? req.flash('success') : [],
      ...options,
    };
    return originalRender(view, locals, callback);
  };

  next();
};
