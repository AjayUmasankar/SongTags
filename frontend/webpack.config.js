const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");


module.exports = [
  {
    // entry: ["./extension/src/AddTagBoxes.ts", "./extension/src/components/TagBox/TagBox.ts", "./extension/src/components/BackendNotifier.ts",
    //         "./extension/src/components/AddTagButton/AddTagButton.scss"],
    // Before we had no imports/exports. Instead we manually injected all our non-modules files (they had no export/import)
    // Webpack takes care of dependencies by starting from an entry and using those imports and etc.
    // Hence, our files were  able to refer to another files class (e.g. AddTagBoxes to TagBox component) without an import
    // This happened because https://stackoverflow.com/questions/69416097/what-does-a-file-without-any-top-level-import-or-export-declarations-is-treated

    mode: 'development',                // Maybe can use this to automatically adjust the backend url we are connecting to
    entry: ["./src/AddTagBoxes.ts",
    "./src/components/TagAddButton/TagAddButton.scss"],
            // "./extension/external_modules/bootstrap-5.1.3/js/bootstrap.js"], 
    context: path.resolve(__dirname, 'extension'),
    output: {
      path: path.resolve(__dirname, "extension"), // You can change this directory to extensionbuilt to see exactly the files produced by our webpack (was just main.js and .css files)
      filename: "[name].js",            // This JS file doesnt include our compiled scss, so we need to load that separately in manifest.json too
      publicPath: ''                    // or else some webpack related error occurs in browser
    },
    devtool: 'inline-source-map',       // This is actually cracked. Even though compilation results in one main.js, debugging in dev tools shows just your file .e.g TagBox
                                        // if you turn this off it just shows main.js, which is pretty much jibberish
    module: {
      // Module.rules allows yo to specify loaders within your webpack configuration 
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
          test: /\.scss$/,
          use: [                                            // loaders are executed from bottom to top
            {
                loader: 'file-loader',                      // Or else webpack will complain about syntax everywhere
                options: { name: '[path][name].css'}        // this is meant to be .min.cs
                                                            
            },
            'sass-loader'
          ]
        }
      ],
    },
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
    resolve: {
      extensions: ['.ts', '.js'],
    },
    target: "web",
    node: {
      __dirname: false,
    },
    watch: true,
  }
];