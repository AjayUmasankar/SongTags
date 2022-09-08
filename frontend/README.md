This was created using only TypeScript.


# Setup
```
npm install
```

# To build using typescript tsc
`npx tsc`

# To autobuild using typescript tsc (only moves .ts to build folder)
CtrlShiftB in Visual Studio Code and select tsc: watch - tsconfig.json
`npx tsc watch`       # this may be the same way to achieve the above

# To autobuild build using Babel (moves all files to built folder)
`npx babel extension --out-dir ./extensionbuilt --extensions ".ts" --copy-files --watch --no-copy-ignored`


# To test your frontend code changes
You will need to first load unpacked extension on Google Chrome
After subsequent changes and auto build completion, you need to refresh the extension.

