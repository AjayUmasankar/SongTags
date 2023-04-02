const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");



module.exports = [
  {
    mode: 'development',                
    entry: ["./TagBoxInjector.ts", "./components/TagBox/TagBox.css"],   // No longer need to include .css and .scss files here IF we import them in our .ts files as modules (renamed to .module.css or .module.scss)
                                                                        // however, the class names become jibberish and we need to use them properly in our code instead of abusing global scope for css :joy:
    context: path.resolve(__dirname, 'contentscript'),                  // because of this context, our entry files dont need the extra 'contentscript'
    output: {
      path: path.resolve(__dirname, 'dist'),  // DEFAULT VALUE: even without this line, our files would still go into dist/
      filename: "[name].js",                  // This JS file doesnt include our compiled scss, so we need to load that separately in manifest.json too
      publicPath: 'brotherwhendoineedthis/'   // publicPath represents the path from which bundled files should be accessed by the browser. In other words: publicPath is an alias for files located at path, and if specified, files are accessible from the publicPath in the browser. 
    },
    devtool: 'inline-source-map',       // This is actually cracked. Even though compilation results in one main.js, debugging in dev tools shows just your file .e.g TagBox
                                        // if you turn this off it just shows main.js, which is pretty much jibberish
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "babel-loader",   // Loaders are transformations that are applied to the source code of a module. e.g. ts->js
                                    // Loaders can even allow you to do things like import css files directly from ur js modules
                                    // If we used ts-loader, we will rely on tsconfig.json
          exclude: /node_modules/,
          options: {  presets: ["@babel/typescript"]  }
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [MiniCssExtractPlugin.loader, {loader: "css-loader"}, "sass-loader"]       // sass-loader converts SASS to CSS 
          // {loader: "css-loader", options: {modules:true}}
                                                                                          // css-loader to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
        }
        // {
        //   test: /\.scss$/,
        //   use: [                                            // loaders are executed from bottom to top
        //     {
        //         loader: 'file-loader',                      // Or else webpack will complain about syntax everywhere
        //         options: { name: '[path][name].css'}        // this is meant to be .min.cs
        //     },
        //     'sass-loader'
        //   ]
        // }
      ],
    },
    plugins: [new MiniCssExtractPlugin({filename: 'main.css'})],        // This is the replacement for ExtractTextPlugin (only for webpack 3 and below)
    resolve: {
      extensions: ['.ts', '.js'],     // if we are importing './somefile', then it will look for ./somefile, ./somefile.ts, ./somefile.js          
    },                                // also, without this you literally cant import from .ts files... holy
    target: "web",      // Compile for usage in a browser-like environment. this is the default 
    watch: true,                    // After the initial build, webpack will continue to watch for changes in any of the resolved files
    watchOptions: {
      aggregateTimeout: 2000        // waits 2 seconds after a save before building
    }
  }
];



// use this if you want to send all extension only files toa separate directory 
// const CopyPlugin = require("copy-webpack-plugin");
    // plugins: [
    //   new CopyPlugin({
    //     patterns: [
    //       { from: "**/*.css", to: "[path][name][ext]"},
    //       { from: "**/*.png", to: "[path][name][ext]"},
    //       { from: "**/*.html", to: "[path][name][ext]"},
    //       { from: "external_modules/bootstrap-5.1.3/bootstrap.min.js", to: "external_modules/bootstrap-5.1.3/bootstrap.min.js"}, // can change this to **/*.min.js ?
    //       { from: "manifest.json", to: "manifest.json"}  // can change this to **/*.json
    //     ]
    //   })
    // ],