# Quickstart - Extension Development Only
The backend will not be hosted, but the extension will continue to be recompiled automatically on any code changes.
```
npm run watch
```

<!-- This will run the following in watch mode (will react to code changes live):
    * Typescript type checking == `npx tsc watch`, this will use the current configuration of tsconfig.json
    * Webpack == `npx webpack`, this will run webpack according to webpack.config.js 
        * Transpiles .ts to .js using Babel
        * Compiles .scss to .css using Sass Loader
        * Bundlies .js (resolves imports) into one file
        * Moves the compiled .js and .css files to extension/
        * Moves the other files in extension/ to extension/, retaining directory structure -->

<!-- # Babel Only (NOT RECOMMENDED)
Compiles .ts and moves all files (compiled and other) into extensionbuilt/ directory. Does not do anything for .scss files
currently wont work as import statements arent bundled and chrome will complain about using imports outside a module
`npx babel extension --out-dir ./extensionbuilt --extensions ".ts" --copy-files --watch --no-copy-ignored -s` ~~ -->



# Backend URL
By default, the frontend will hit the locally hosted backend. If it is not available, it will use Railway's backend. 
To change this, you will need to modify TagService.ts



