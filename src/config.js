const defaults = {
  showCallers: false
};

module.exports = function getDefaultConfig(config) {
  return {
    ...defaults,
    ...config
  };
}
