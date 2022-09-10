This was created using only TypeScript.


# Setup
```
cd frontend
npm install
```

# To build using typescript (NOT RECOMMENDED)
This method depends on the current configuration of tsconfig.json and will ONLY move configured .ts files
This probably wont work, especially if "noEmit" is turned on
## Manually
`npx tsc`

## Autobuild/watch 
CtrlShiftB in Visual Studio Code and select tsc: watch - tsconfig.json
`npx tsc watch`       # this may be the same way to achieve the above

# To Autobuild/Watch using Babel  (NOT RECOMMENDED)
moves all files to built folder and transpiles .ts. Does not do anything for .scss files
currently wont work as import statements arent bundled and chrome will complain about using imports outside a module
`npx babel extension --out-dir ./extensionbuilt --extensions ".ts" --copy-files --watch --no-copy-ignored -s`

# To Autobuild/Watch using Webpack (RECCOMMENDED)
`npx webpack`


# To test your frontend code changes
You will need to first load unpacked extension on Google Chrome
After subsequent changes and auto build completion, you need to refresh the extension.

