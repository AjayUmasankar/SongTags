Created with TypeScript, Sass, Babel, and Webpack!

# Quick Start Frontend Development 
```
npm run startfrontend
```

This will run the following in watch mode (will react to code changes live):
    - Typescript type checking == `npx tsc watch`, this will use the current configuration of tsconfig.json
    - Webpack == `npx webpack`, this will run webpack according to webpack.config.js 
        - Transpiles .ts to .js using Babel
        - Compiles .scss to .css using Sass Loader
        - Bundlies .js (resolves imports) into one file
        <!-- - Moves the compiled .js and .css files to extension/ -->
        <!-- - Moves the other files in extension/ to extension/, retaining directory structure -->


# Install Chrome Extension
After compilation, you will need to manually load the unpacked extension on Google Chrome
After subsequent changes and auto build completion, you need to click the refresh button on the extension using Google Chrome's Extension screens UI

<!-- # Babel Only (NOT RECOMMENDED)
Compiles .ts and moves all files (compiled and other) into extensionbuilt/ directory. Does not do anything for .scss files
currently wont work as import statements arent bundled and chrome will complain about using imports outside a module
`npx babel extension --out-dir ./extensionbuilt --extensions ".ts" --copy-files --watch --no-copy-ignored -s` ~~ -->



## Hardcoded Backend URL Change
By default, the frontend will hit the locally hosted backend.
To change this, you will need to modify the following in BackendNotifier.ts
```
static tagsResource: string = "http://127.0.0.1:8000/tags/ajay/"
```


