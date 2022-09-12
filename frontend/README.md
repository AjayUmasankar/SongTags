Created with TypeScript, Sass, Babel, and Webpack!

# Setup
```
cd frontend
npm install
```

# Workflow 
## Type Checking
This depends on the current configuration of tsconfig.json.
Use any of the options below
`npx tsc`
`npx tsc watch`
CtrlShiftB in Visual Studio Code and select tsc: watch - tsconfig.json

~~ ## Babel  (NOT RECOMMENDED)
Compiles .ts and moves all files (compiled and other) into extensionbuilt/ directory. Does not do anything for .scss files
currently wont work as import statements arent bundled and chrome will complain about using imports outside a module
`npx babel extension --out-dir ./extensionbuilt --extensions ".ts" --copy-files --watch --no-copy-ignored -s` ~~

## Build via Webpack (w/ watch mode)
Compiles .ts (via Babel) and .scss (via Sass) files. 
Copies all files (compiled and other) into extensionbuilt/ directory, retaining directory structure 
`npx webpack`


## Deploy Extension
You will need to first load unpacked extension on Google Chrome
After subsequent changes and auto build completion, you need to refresh the extension.

