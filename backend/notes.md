*************PYTHON AND MONGODB LEARNINGS**************
Pymongo vs Motor - https://gist.github.com/anand2312/840aeb3e98c3d7dbb3db8b757c1a7ace
pymongo is synchronous, motor is asynchronous

Pydantic docs are good for creating Models based on your MongoDB data! Models are good for get methods 

uvicorn app:app --reload starts the backend 


For a good example of updating your mongodb object check add tag function


QUERY PARAMETERS
https://fastapi.tiangolo.com/tutorial/query-params/ 





*****************JS LEARNINGS ******************
this.divEl.addEventListener("click", (evt: any) => evt.stopPropagation()); so that parent element event handlers arent called


*****************TYPESCRIPT LEARNINGS*****************
auto compile into js files on save. CtrlShiftB and select tsc: watch - tsconfig.json
https://stackoverflow.com/questions/29996145/visual-studio-code-compile-on-save



***************** api request learnings *****************
Sending a request from the browser with no-cors gets an opaque response which wont work. The server needs to send the required CORS headers
https://stackoverflow.com/questions/35169728/redux-fetch-body-is-not-use-with-no-cors-mode/35291777#35291777

For passing in chonky bodies for your requests, you should use the RAW type in postman and select the data type as json