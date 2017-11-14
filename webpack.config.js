var Encore = require('@symfony/webpack-encore');

Encore
// directory where all compiled assets will be stored
  .setOutputPath('output_dev/assets/')

  // what's the public path to this directory (relative to your project's document root dir)
  .setPublicPath('/assets')

  // empty the outputPath dir before each build
  .cleanupOutputBeforeBuild()

  // will output as web/build/app.js
  .addEntry('app', './src/Assets/js/main.js')

  // will output as web/build/global.css
  .addStyleEntry('vendor', './src/Assets/scss/vendor.scss')
  .addStyleEntry('main', './src/Assets/scss/main.scss')
  .enableSassLoader(function(options) {
    options.includePaths = [
      'node_modules/foundation-sites/scss',
      'node_modules/font-awesome/scss',
      'node_modules/owl.carousel/src/scss/',
      'node_modules/spinkit/scss'
    ];
  })

  // allow legacy applications to use $/jQuery as a global variable
  // .autoProvidejQuery()

  .enableSourceMaps(!Encore.isProduction())

// create hashed filenames (e.g. app.abc123.css)
// .enableVersioning()
;

// export the final configuration
module.exports = Encore.getWebpackConfig();