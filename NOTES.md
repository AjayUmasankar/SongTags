*************PYTHON AND MONGODB LEARNINGS**************
Pymongo vs Motor - https://gist.github.com/anand2312/840aeb3e98c3d7dbb3db8b757c1a7ace
pymongo is synchronous, motor is asynchronous

Pydantic docs are good for creating Models based on your MongoDB data! Models are good for get methods 


For a good example of updating your mongodb object check add tag function

accessing databases and collections is case sensitive

Pydantic BaseSettings allows for easy reading in of env variables, from file or heroku or otherwise

Need to point vscode python interpreter (Ctrlshiftp) to the virtual environment

Its better to always update db instead of just calling the db once at the start and keeping track of local and db copy

pytyhon global variables can be referenced easily. altho to modify it you need to do a `global varname` at the start of function

python defaultdict and nesteddict

***************** heroku learnings **********************
heroku machines use linux so you need to maintain two different procfiles :(
`heroku config:set LOG_LEVEL=debug` more logs
`heroku local web -f Procfile.windows` to test if your heroku Procfile works locally. 
web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app  # cant use this faster version cuz of windows and cant debug locally
web: uvicorn main:app --workers 4 --host=0.0.0.0 --port=${PORT}

`heroku apps:info` - info on your heroku app (the app is the thing you deployed)
`heroku logs`
`heroku ps -a songtagsbackend` - see how much free dyno hours u have left

Can actually find all the ip ranges for heroku with this guys command. Then whitelist that range instead of allowing all.
https://stackoverflow.com/questions/42159175/connecting-heroku-app-to-atlas-mongodb-cloud-service


*****************JS LEARNINGS ******************
this.divEl.addEventListener("click", (evt: any) => evt.stopPropagation()); so that parent element event handlers arent called

The total width of the label element is equivalent to the textbox that it covers! Their width animations also match, making it seamless!

    // The retrieved element has parent yt-* which has parent h3. The retrieved element also has attribute href which starts with /playlist
    const playlistNameEl = document.querySelector('h3 yt-formatted-string a[href^="/playlist"]') as HTMLAnchorElement;
    https://bobbyhadz.com/blog/javascript-queryselector-class-contains

    border-inline is the left and right. border-inline-start is the left
    border-block is the top and down. border-block-start is the top

    if youre messing around with width and height of div elements. 
    its important to know that the constraint doesnt have to be set on the top level divs
    you may have to follow the child elements down to see where the width/height constraint is set
    this is because the parent div elements adjust to fit the small object that has height/width set on it
    
*****************TYPESCRIPT LEARNINGS*****************
In TypeScript, just as in ECMAScript 2015, any file containing a top-level import or export is considered a module. 
Conversely, a file without any top-level import or export declarations is treated as a script whose contents are available 
in the global scope (and therefore to modules as well).

auto compile into js files on save. CtrlShiftB and select tsc: watch - tsconfig.json
https://stackoverflow.com/questions/29996145/visual-studio-code-compile-on-save

regex syntax. need to fucking escape ? with two \\ 

query selector in AddTagboxes soo useful

`npx tsc` does type checking `npx tsc --watch`

if typescript is complaining about references. e.g. cant find TagBox from AddTagBoxes.ts, then add a path to TagBox in tsconfig.json include section.
Even with ts complaining, babel will still compile fine 
tsconfig.json has useful comments

https://iamturns.com/typescript-babel/
babel.config.json has useful comments
babel used for transpiling (translate programming language -> another). Faster JS emit time apparantly 
Babel can be set to output javascript that is compatible for certain browsers and versions. 
Can set to compile with latest browsers for dev and larger range during production
Babel means that we will only need ONE compiler. Instead of linters, test runners, build systems, and boilerplates supporting different compilers, they just need to support Babel.
Its faster to compile than typescript watch. 
We can have it only check for type errors when youre ready.
-s is used for source maps
Babel configuration is highkey a nightmare, check this project again if youre trying to compile some files and copy some files to a built folder.]

cant stringify a es6 map lmfaoaaaa

***************** api request learnings *****************
Sending a request from the browser with no-cors gets an opaque response which wont work. The server needs to send the required CORS headers
https://stackoverflow.com/questions/35169728/redux-fetch-body-is-not-use-with-no-cors-mode/35291777#35291777

For passing in chonky bodies for your requests, you should use the RAW type in postman and select the data type as json

trying to connect to http instead of https can give back Failed to fetch error for the js running in the browser.

*************** general learnings ****************
to set env variables in powershell 
$env:PORT = 1234