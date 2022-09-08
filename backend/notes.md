*************PYTHON AND MONGODB LEARNINGS**************
Pymongo vs Motor - https://gist.github.com/anand2312/840aeb3e98c3d7dbb3db8b757c1a7ace
pymongo is synchronous, motor is asynchronous

Pydantic docs are good for creating Models based on your MongoDB data! Models are good for get methods 


For a good example of updating your mongodb object check add tag function

accessing databases and collections is case sensitive

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


*****************TYPESCRIPT LEARNINGS*****************
auto compile into js files on save. CtrlShiftB and select tsc: watch - tsconfig.json
https://stackoverflow.com/questions/29996145/visual-studio-code-compile-on-save

regex syntax

`npx tsc` does type checking `npx tsc --watch`

https://iamturns.com/typescript-babel/
babel.config.json
babel used for transpiling (translate programming language -> another). Faster JS emit time apparantly 
Babel can be set to output javascript that is compatible for certain browsers and versions. 
Can set to compile with latest browsers for dev and larger range during production
Babel means that we will only need ONE compiler. Instead of linters, test runners, build systems, and boilerplates supporting different compilers, they just need to support Babel.
Its faster to compile than typescript watch. 
We can have it only check for type errors when youre ready.

***************** api request learnings *****************
Sending a request from the browser with no-cors gets an opaque response which wont work. The server needs to send the required CORS headers
https://stackoverflow.com/questions/35169728/redux-fetch-body-is-not-use-with-no-cors-mode/35291777#35291777

For passing in chonky bodies for your requests, you should use the RAW type in postman and select the data type as json

trying to connect to http instead of https can give back Failed to fetch error for the js running in the browser.

*************** general learnings ****************
to set env variables in powershell 
$env:PORT = 1234