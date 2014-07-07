module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/grunt-traceur/node_modules/traceur/bin/traceur-runtime.js',
      'build/*.js',
      'test/*.spec.js'
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch:false, 
    browsers: ['Chrome'],
    captureTimeout: 60000,
    singleRun: false
  });
};