/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./logger.js":
/*!*******************!*\
  !*** ./logger.js ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "logger": () => (/* binding */ logger)
/* harmony export */ });
const pino = __webpack_require__(/*! pino */ "../node_modules/pino/browser.js");

const level = "debug";
const prettyPrint = {
	colorize: "true", // --colorize: add terminal color escape sequence to the output
	levelFirst: true, // --levelFirst: display the log level name before the logged date and time
	translateTime: "SYS:standard", // --translateTime: translate the epoch time to local system's TZ, in human readable format
	ignore: "pid,hostname,module" // --ignore: ignore one or several keys
	// singleLine: true, // --singleLine: print each log message on a single line
	// messageFormat: "({module}) {msg}" // --messageFormat: format outpout for the message portion of the log
};

const logger = pino({
	name: "server",
	level: "debug",
	formatters: {
		level(label) {
			return { level: label };
		}
	},
	prettyPrint: prettyPrint
})

/***/ }),

/***/ "./TagService.ts":
/*!***********************!*\
  !*** ./TagService.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TagService": () => (/* binding */ TagService)
/* harmony export */ });
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger */ "./logger.js");

class TagService {
  static endpoint = "http://localhost:8000";
  static async getEndpoint() {
    const healthUrl = `${TagService.endpoint}/`;
    const res = await TagService.get(healthUrl);
    if (res.type == "error") {
      _logger__WEBPACK_IMPORTED_MODULE_0__.logger.warn(`Local API not found, using Railway at: https://songtags-production.up.railway.app`);
      TagService.endpoint = "https://songtags-production.up.railway.app";
    }
    return this.endpoint;
  }
  static async getTags(userEmail, songId, songName, playlistId, playlistName, uploader = "") {
    songName = encodeURIComponent(songName);
    var url = `${TagService.endpoint}/tags/${userEmail}/${songId}?uploader=${uploader}&song_name=${songName}&playlist_name=${playlistName}&playlist_id=${playlistId}`;
    // url = encodeURI(url) // or else # in songname will break
    return await TagService.get(url).then(res => res.json()).then(tagsObj => {
      const tagsMap = new Map(Object.entries(tagsObj));
      _logger__WEBPACK_IMPORTED_MODULE_0__.logger.info("Recieved tagsObj which was converted into tagsMap", tagsObj, tagsMap);
      return tagsMap;
    });
  }
  static async setTag(userEmail, songId, tagName) {
    const url = `${TagService.endpoint}/tags/${userEmail}/${songId}/${tagName}`;
    return await TagService.post(url).then(res => res.json());
  }
  static async deleteTag(userEmail, songId, tagName) {
    const url = `${TagService.endpoint}/tags/${userEmail}/${songId}/${tagName}`;
    return await TagService.delete(url).then(res => res.json());
  }
  static async get(path) {
    const params = {
      method: 'GET',
      redirect: 'follow',
      mode: 'cors'
    };
    return TagService.fetchWithErrorHandling(path, params);
  }
  static async post(path, body) {
    const params = {
      method: "POST",
      redirect: 'follow',
      mode: 'cors'
    };
    if (body) {
      params.headers = {
        "content-type": "application/json"
      };
      params.body = JSON.stringify(body);
    }
    return TagService.fetchWithErrorHandling(path, params);
  }
  static async delete(path, body) {
    const params = {
      method: "DELETE",
      redirect: 'follow',
      mode: 'cors'
    };
    if (body) {
      params.headers = {
        "content-type": "application/json"
      };
      params.body = JSON.stringify(body);
    }
    return TagService.fetchWithErrorHandling(path, params);
  }
  static async fetchWithErrorHandling(path, params) {
    try {
      const response = await fetch(path, params);
      if (!response.ok) throw response;
      return response;
    } catch (error) {
      _logger__WEBPACK_IMPORTED_MODULE_0__.logger.warn(error, `${params.method} request failed for ${path}!`);
      return Response.error();
    }
  }
}

/***/ }),

/***/ "./components/TagBox/TagBox.ts":
/*!*************************************!*\
  !*** ./components/TagBox/TagBox.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Tag": () => (/* binding */ Tag),
/* harmony export */   "TagBox": () => (/* binding */ TagBox)
/* harmony export */ });
/* harmony import */ var _TagService__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../TagService */ "./TagService.ts");
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../logger */ "./logger.js");
/* harmony import */ var _TagBoxAddButton_module_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TagBoxAddButton.module.scss */ "./components/TagBox/TagBoxAddButton.module.scss");



class Tag {
  constructor(name, type = "normal", date = new Date().toISOString()) {
    this.name = name;
    this.type = type;
    this.date = date;
    this.priority = 500;
  }
}
class TagBox {
  divEl = document.createElement('div');
  constructor(userEmail, songId, tags = new Map()) {
    this.userEmail = userEmail;
    this.songId = songId;
    this.tags = tags;

    // Setup the div and input element 
    this.divEl.classList.add("tagbox");
    this.divEl.addEventListener("click", evt => evt.stopPropagation()); // Or else we trigger youtubes click handler and enter the song on playlist page
    this.divEl.innerHTML = `
        <div class="${_TagBoxAddButton_module_scss__WEBPACK_IMPORTED_MODULE_2__["default"]["text-input"]}">
            <input type="text" id="` + songId + `">
            <label for="` + songId + `" class=${_TagBoxAddButton_module_scss__WEBPACK_IMPORTED_MODULE_2__["default"].taglabel}>+</label>
        </div>
        `;
    this.inputEl = this.divEl.querySelector("input"), this.inputEl.addEventListener("keyup", this.addTag.bind(this));

    // First render of the tags
    tags.forEach(tag => this.addTagFrontend(tag));
  }
  async addTag(e) {
    if (e.key !== 'Enter') return;
    let inputEl = e.target;
    let tagName = inputEl.value.replace(/\s+/g, ' ');
    let tag = await _TagService__WEBPACK_IMPORTED_MODULE_0__.TagService.setTag(this.userEmail, this.songId, tagName);
    if (this.tags.has(tag.name)) return;
    _logger__WEBPACK_IMPORTED_MODULE_1__.logger.info("Adding tag: ", tag);
    this.addTagFrontend(tag);
  }
  addTagFrontend(tag) {
    let anchorTag = document.createElement('a');
    anchorTag.href = "javascript:;";
    anchorTag.classList.add("pill");
    anchorTag.classList.add(tag.type); // will be used to give different color to tags
    anchorTag.innerHTML = `\#${tag.name} `;
    let deleteTagBound = this.deleteTag.bind(this);
    anchorTag.addEventListener('click', evt => deleteTagBound(evt, tag.name));
    this.divEl.insertAdjacentElement("afterbegin", anchorTag);
  }
  async deleteTag(evt, tagName) {
    let element = evt.target;
    console.log('Removing tag element:', element);
    if (!element) return;
    this.tags.delete(tagName);
    element.remove();
    _TagService__WEBPACK_IMPORTED_MODULE_0__.TagService.deleteTag(this.userEmail, this.songId, tagName);
  }
}

/***/ }),

/***/ "./components/TagBox/TagBoxAddButton.module.scss":
/*!*******************************************************!*\
  !*** ./components/TagBox/TagBoxAddButton.module.scss ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// extracted by mini-css-extract-plugin
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"text-input":"yIKdawcZGizfhSpPGDOG","taglabel":"IRV63c4Kf52tW7L53evW"});

/***/ }),

/***/ "../node_modules/quick-format-unescaped/index.js":
/*!*******************************************************!*\
  !*** ../node_modules/quick-format-unescaped/index.js ***!
  \*******************************************************/
/***/ ((module) => {


function tryStringify (o) {
  try { return JSON.stringify(o) } catch(e) { return '"[Circular]"' }
}

module.exports = format

function format(f, args, opts) {
  var ss = (opts && opts.stringify) || tryStringify
  var offset = 1
  if (typeof f === 'object' && f !== null) {
    var len = args.length + offset
    if (len === 1) return f
    var objects = new Array(len)
    objects[0] = ss(f)
    for (var index = 1; index < len; index++) {
      objects[index] = ss(args[index])
    }
    return objects.join(' ')
  }
  if (typeof f !== 'string') {
    return f
  }
  var argLen = args.length
  if (argLen === 0) return f
  var str = ''
  var a = 1 - offset
  var lastPos = -1
  var flen = (f && f.length) || 0
  for (var i = 0; i < flen;) {
    if (f.charCodeAt(i) === 37 && i + 1 < flen) {
      lastPos = lastPos > -1 ? lastPos : 0
      switch (f.charCodeAt(i + 1)) {
        case 100: // 'd'
        case 102: // 'f'
          if (a >= argLen)
            break
          if (args[a] == null)  break
          if (lastPos < i)
            str += f.slice(lastPos, i)
          str += Number(args[a])
          lastPos = i + 2
          i++
          break
        case 105: // 'i'
          if (a >= argLen)
            break
          if (args[a] == null)  break
          if (lastPos < i)
            str += f.slice(lastPos, i)
          str += Math.floor(Number(args[a]))
          lastPos = i + 2
          i++
          break
        case 79: // 'O'
        case 111: // 'o'
        case 106: // 'j'
          if (a >= argLen)
            break
          if (args[a] === undefined) break
          if (lastPos < i)
            str += f.slice(lastPos, i)
          var type = typeof args[a]
          if (type === 'string') {
            str += '\'' + args[a] + '\''
            lastPos = i + 2
            i++
            break
          }
          if (type === 'function') {
            str += args[a].name || '<anonymous>'
            lastPos = i + 2
            i++
            break
          }
          str += ss(args[a])
          lastPos = i + 2
          i++
          break
        case 115: // 's'
          if (a >= argLen)
            break
          if (lastPos < i)
            str += f.slice(lastPos, i)
          str += String(args[a])
          lastPos = i + 2
          i++
          break
        case 37: // '%'
          if (lastPos < i)
            str += f.slice(lastPos, i)
          str += '%'
          lastPos = i + 2
          i++
          a--
          break
      }
      ++a
    }
    ++i
  }
  if (lastPos === -1)
    return f
  else if (lastPos < flen) {
    str += f.slice(lastPos)
  }

  return str
}


/***/ }),

/***/ "../node_modules/pino/browser.js":
/*!***************************************!*\
  !*** ../node_modules/pino/browser.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const format = __webpack_require__(/*! quick-format-unescaped */ "../node_modules/quick-format-unescaped/index.js")

module.exports = pino

const _console = pfGlobalThisOrFallback().console || {}
const stdSerializers = {
  mapHttpRequest: mock,
  mapHttpResponse: mock,
  wrapRequestSerializer: passthrough,
  wrapResponseSerializer: passthrough,
  wrapErrorSerializer: passthrough,
  req: mock,
  res: mock,
  err: asErrValue
}

function shouldSerialize (serialize, serializers) {
  if (Array.isArray(serialize)) {
    const hasToFilter = serialize.filter(function (k) {
      return k !== '!stdSerializers.err'
    })
    return hasToFilter
  } else if (serialize === true) {
    return Object.keys(serializers)
  }

  return false
}

function pino (opts) {
  opts = opts || {}
  opts.browser = opts.browser || {}

  const transmit = opts.browser.transmit
  if (transmit && typeof transmit.send !== 'function') { throw Error('pino: transmit option must have a send function') }

  const proto = opts.browser.write || _console
  if (opts.browser.write) opts.browser.asObject = true
  const serializers = opts.serializers || {}
  const serialize = shouldSerialize(opts.browser.serialize, serializers)
  let stdErrSerialize = opts.browser.serialize

  if (
    Array.isArray(opts.browser.serialize) &&
    opts.browser.serialize.indexOf('!stdSerializers.err') > -1
  ) stdErrSerialize = false

  const levels = ['error', 'fatal', 'warn', 'info', 'debug', 'trace']

  if (typeof proto === 'function') {
    proto.error = proto.fatal = proto.warn =
    proto.info = proto.debug = proto.trace = proto
  }
  if (opts.enabled === false || opts.browser.disabled) opts.level = 'silent'
  const level = opts.level || 'info'
  const logger = Object.create(proto)
  if (!logger.log) logger.log = noop

  Object.defineProperty(logger, 'levelVal', {
    get: getLevelVal
  })
  Object.defineProperty(logger, 'level', {
    get: getLevel,
    set: setLevel
  })

  const setOpts = {
    transmit,
    serialize,
    asObject: opts.browser.asObject,
    levels,
    timestamp: getTimeFunction(opts)
  }
  logger.levels = pino.levels
  logger.level = level

  logger.setMaxListeners = logger.getMaxListeners =
  logger.emit = logger.addListener = logger.on =
  logger.prependListener = logger.once =
  logger.prependOnceListener = logger.removeListener =
  logger.removeAllListeners = logger.listeners =
  logger.listenerCount = logger.eventNames =
  logger.write = logger.flush = noop
  logger.serializers = serializers
  logger._serialize = serialize
  logger._stdErrSerialize = stdErrSerialize
  logger.child = child

  if (transmit) logger._logEvent = createLogEventShape()

  function getLevelVal () {
    return this.level === 'silent'
      ? Infinity
      : this.levels.values[this.level]
  }

  function getLevel () {
    return this._level
  }
  function setLevel (level) {
    if (level !== 'silent' && !this.levels.values[level]) {
      throw Error('unknown level ' + level)
    }
    this._level = level

    set(setOpts, logger, 'error', 'log') // <-- must stay first
    set(setOpts, logger, 'fatal', 'error')
    set(setOpts, logger, 'warn', 'error')
    set(setOpts, logger, 'info', 'log')
    set(setOpts, logger, 'debug', 'log')
    set(setOpts, logger, 'trace', 'log')
  }

  function child (bindings, childOptions) {
    if (!bindings) {
      throw new Error('missing bindings for child Pino')
    }
    childOptions = childOptions || {}
    if (serialize && bindings.serializers) {
      childOptions.serializers = bindings.serializers
    }
    const childOptionsSerializers = childOptions.serializers
    if (serialize && childOptionsSerializers) {
      var childSerializers = Object.assign({}, serializers, childOptionsSerializers)
      var childSerialize = opts.browser.serialize === true
        ? Object.keys(childSerializers)
        : serialize
      delete bindings.serializers
      applySerializers([bindings], childSerialize, childSerializers, this._stdErrSerialize)
    }
    function Child (parent) {
      this._childLevel = (parent._childLevel | 0) + 1
      this.error = bind(parent, bindings, 'error')
      this.fatal = bind(parent, bindings, 'fatal')
      this.warn = bind(parent, bindings, 'warn')
      this.info = bind(parent, bindings, 'info')
      this.debug = bind(parent, bindings, 'debug')
      this.trace = bind(parent, bindings, 'trace')
      if (childSerializers) {
        this.serializers = childSerializers
        this._serialize = childSerialize
      }
      if (transmit) {
        this._logEvent = createLogEventShape(
          [].concat(parent._logEvent.bindings, bindings)
        )
      }
    }
    Child.prototype = this
    return new Child(this)
  }
  return logger
}

pino.levels = {
  values: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10
  },
  labels: {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal'
  }
}

pino.stdSerializers = stdSerializers
pino.stdTimeFunctions = Object.assign({}, { nullTime, epochTime, unixTime, isoTime })

function set (opts, logger, level, fallback) {
  const proto = Object.getPrototypeOf(logger)
  logger[level] = logger.levelVal > logger.levels.values[level]
    ? noop
    : (proto[level] ? proto[level] : (_console[level] || _console[fallback] || noop))

  wrap(opts, logger, level)
}

function wrap (opts, logger, level) {
  if (!opts.transmit && logger[level] === noop) return

  logger[level] = (function (write) {
    return function LOG () {
      const ts = opts.timestamp()
      const args = new Array(arguments.length)
      const proto = (Object.getPrototypeOf && Object.getPrototypeOf(this) === _console) ? _console : this
      for (var i = 0; i < args.length; i++) args[i] = arguments[i]

      if (opts.serialize && !opts.asObject) {
        applySerializers(args, this._serialize, this.serializers, this._stdErrSerialize)
      }
      if (opts.asObject) write.call(proto, asObject(this, level, args, ts))
      else write.apply(proto, args)

      if (opts.transmit) {
        const transmitLevel = opts.transmit.level || logger.level
        const transmitValue = pino.levels.values[transmitLevel]
        const methodValue = pino.levels.values[level]
        if (methodValue < transmitValue) return
        transmit(this, {
          ts,
          methodLevel: level,
          methodValue,
          transmitLevel,
          transmitValue: pino.levels.values[opts.transmit.level || logger.level],
          send: opts.transmit.send,
          val: logger.levelVal
        }, args)
      }
    }
  })(logger[level])
}

function asObject (logger, level, args, ts) {
  if (logger._serialize) applySerializers(args, logger._serialize, logger.serializers, logger._stdErrSerialize)
  const argsCloned = args.slice()
  let msg = argsCloned[0]
  const o = {}
  if (ts) {
    o.time = ts
  }
  o.level = pino.levels.values[level]
  let lvl = (logger._childLevel | 0) + 1
  if (lvl < 1) lvl = 1
  // deliberate, catching objects, arrays
  if (msg !== null && typeof msg === 'object') {
    while (lvl-- && typeof argsCloned[0] === 'object') {
      Object.assign(o, argsCloned.shift())
    }
    msg = argsCloned.length ? format(argsCloned.shift(), argsCloned) : undefined
  } else if (typeof msg === 'string') msg = format(argsCloned.shift(), argsCloned)
  if (msg !== undefined) o.msg = msg
  return o
}

function applySerializers (args, serialize, serializers, stdErrSerialize) {
  for (const i in args) {
    if (stdErrSerialize && args[i] instanceof Error) {
      args[i] = pino.stdSerializers.err(args[i])
    } else if (typeof args[i] === 'object' && !Array.isArray(args[i])) {
      for (const k in args[i]) {
        if (serialize && serialize.indexOf(k) > -1 && k in serializers) {
          args[i][k] = serializers[k](args[i][k])
        }
      }
    }
  }
}

function bind (parent, bindings, level) {
  return function () {
    const args = new Array(1 + arguments.length)
    args[0] = bindings
    for (var i = 1; i < args.length; i++) {
      args[i] = arguments[i - 1]
    }
    return parent[level].apply(this, args)
  }
}

function transmit (logger, opts, args) {
  const send = opts.send
  const ts = opts.ts
  const methodLevel = opts.methodLevel
  const methodValue = opts.methodValue
  const val = opts.val
  const bindings = logger._logEvent.bindings

  applySerializers(
    args,
    logger._serialize || Object.keys(logger.serializers),
    logger.serializers,
    logger._stdErrSerialize === undefined ? true : logger._stdErrSerialize
  )
  logger._logEvent.ts = ts
  logger._logEvent.messages = args.filter(function (arg) {
    // bindings can only be objects, so reference equality check via indexOf is fine
    return bindings.indexOf(arg) === -1
  })

  logger._logEvent.level.label = methodLevel
  logger._logEvent.level.value = methodValue

  send(methodLevel, logger._logEvent, val)

  logger._logEvent = createLogEventShape(bindings)
}

function createLogEventShape (bindings) {
  return {
    ts: 0,
    messages: [],
    bindings: bindings || [],
    level: { label: '', value: 0 }
  }
}

function asErrValue (err) {
  const obj = {
    type: err.constructor.name,
    msg: err.message,
    stack: err.stack
  }
  for (const key in err) {
    if (obj[key] === undefined) {
      obj[key] = err[key]
    }
  }
  return obj
}

function getTimeFunction (opts) {
  if (typeof opts.timestamp === 'function') {
    return opts.timestamp
  }
  if (opts.timestamp === false) {
    return nullTime
  }
  return epochTime
}

function mock () { return {} }
function passthrough (a) { return a }
function noop () {}

function nullTime () { return false }
function epochTime () { return Date.now() }
function unixTime () { return Math.round(Date.now() / 1000.0) }
function isoTime () { return new Date(Date.now()).toISOString() } // using Date.now() for testability

/* eslint-disable */
/* istanbul ignore next */
function pfGlobalThisOrFallback () {
  function defd (o) { return typeof o !== 'undefined' && o }
  try {
    if (typeof globalThis !== 'undefined') return globalThis
    Object.defineProperty(Object.prototype, 'globalThis', {
      get: function () {
        delete Object.prototype.globalThis
        return (this.globalThis = this)
      },
      configurable: true
    })
    return globalThis
  } catch (e) {
    return defd(self) || defd(window) || defd(this) || {}
  }
}
/* eslint-enable */


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
var __webpack_exports__ = {};
/*!***************************!*\
  !*** ./TagBoxInjector.ts ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_TagBox_TagBox__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/TagBox/TagBox */ "./components/TagBox/TagBox.ts");
/* harmony import */ var _TagService__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TagService */ "./TagService.ts");
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./logger */ "./logger.js");



const userEmail = "ajayumasankar@gmail.com";
const delay = t => new Promise(resolve => setTimeout(resolve, t));
window.onload = async () => {
  await _TagService__WEBPACK_IMPORTED_MODULE_1__.TagService.getEndpoint();
  const currentUrl = window.location.href;
  const playlistRegex = new RegExp('youtube\.com\/playlist\\?list=', 'i');
  if (playlistRegex.test(currentUrl)) delay(3000).then(() => injectTagBoxToPlaylistItems());
  const playlistSongRegex = new RegExp('youtube.com/watch\\?v=(.*)\&list=', 'i');
  if (playlistSongRegex.test(currentUrl)) {
    waitForYoutube();
  }
};
async function injectTagBoxToSong() {
  // primaryEl.querySelector("div.watch-active-metadata div:nth-child(2)")
  const playlistNameEl = document.querySelector('h3 yt-formatted-string a[href^="/playlist"]');
  const channelNameEl = document.querySelector('yt-formatted-string[class*="ytd-channel-name"] a');
  const songNameEl = document.querySelector("div[id=\"container\"] h1 yt-formatted-string");
  const tags = await _TagService__WEBPACK_IMPORTED_MODULE_1__.TagService.getTags(userEmail, getSongId(window.location.href), songNameEl.innerText, getPlaylistId(window.location.href), playlistNameEl.innerText, channelNameEl.innerText);
  _logger__WEBPACK_IMPORTED_MODULE_2__.logger.info("Adding tagbox to currently playing song", {
    "User Email": userEmail,
    "Song ID": getSongId(window.location.href),
    "Song Name": songNameEl.innerText,
    "Playlist ID": getPlaylistId(window.location.href),
    "Playlist Name:": playlistNameEl.innerText,
    "Channel Name": channelNameEl.innerText,
    "Tags": tags
  });
  const tagBoxEl = new _components_TagBox_TagBox__WEBPACK_IMPORTED_MODULE_0__.TagBox(userEmail, getSongId(window.location.href), tags);
  const belowThePlayerEl = document.querySelector("div[id=\"above-the-fold\"]");
  belowThePlayerEl.insertBefore(tagBoxEl.divEl, belowThePlayerEl.firstChild);
}
function injectTagBoxToPlaylistItems() {
  // Traversing the Actual Song Panes
  const displayDialogEl = document.querySelectorAll('#display-dialog')[0];
  const songPanes = document.querySelectorAll("div ytd-playlist-video-renderer");
  console.log(songPanes);
  songPanes.forEach(async songPane => {
    let songPaneEl = songPane;

    // This is the div that represents the whole row
    const contentEl = songPaneEl.children[1];

    // This is youtubes container element including which contains the thumbnail and metadata
    const containerEl = contentEl.children[0];
    containerEl.style.alignItems = 'center';
    contentEl.style.flexWrap = 'nowrap';

    // Within the thumbnail we can get the href
    const thumbnailEl = containerEl.children[0];
    const anchorEl = thumbnailEl.children[0];

    // Within the metadata we can get the song title, author
    const metaEl = containerEl.children[1];
    const metaDataEl = metaEl.children[1].children[0];
    const channelNameContainerEl = metaDataEl.children[0].children[0].children[0];
    const channelNameEl = channelNameContainerEl.children[0].children[0].children[0];
    const songNameEl = metaEl.children[0].children[1];
    const playlistNameEl = displayDialogEl.children[1];
    const tags = await _TagService__WEBPACK_IMPORTED_MODULE_1__.TagService.getTags(userEmail, getSongId(anchorEl.href), songNameEl.innerText, getPlaylistId(window.location.href), playlistNameEl.innerText, channelNameEl.innerText);
    _logger__WEBPACK_IMPORTED_MODULE_2__.logger.info("Adding tagbox to playlist item", {
      "User Email": userEmail,
      "Song ID": getSongId(anchorEl.href),
      "Song Name": songNameEl.innerText,
      "Playlist ID": getPlaylistId(window.location.href),
      "Playlist Name:": playlistNameEl.innerText,
      "Channel Name": channelNameEl.innerText,
      "Tags": tags
    });
    // logger.info(channelNameEl, songNameEl, playlistNameEl)

    const tagBoxEl = new _components_TagBox_TagBox__WEBPACK_IMPORTED_MODULE_0__.TagBox(userEmail, getSongId(anchorEl.href), tags);
    // console.log('This songs parsed url is: ', getSongId(anchorEl.href));
    contentEl.appendChild(tagBoxEl.divEl);
  });
}
const waitForYoutube = async (rootElement = document.documentElement) => {
  let selector = 'above-the-fold';
  console.log(`Waiting for ${selector}...`, new Date().toISOString());
  let config = {
    childList: true,
    subtree: true
  };
  // First, attach tag box when the element is found
  return new Promise(resolve => {
    const observer = new MutationObserver(() => {
      const element = document.getElementById(selector);
      if (element) {
        console.log(`${selector} was found!`, new Date().toISOString());
        injectTagBoxToSong();
        observer.disconnect();
        resolve(element);
      }
    });
    observer.observe(rootElement, config);
  }).then(element => {
    // Secondly, this is for when we go to a new song and the element changes
    selector = 'div#above-the-fold div#title h1'; // element that holds title
    const descriptionChanged = function (mutationsList, observer) {
      console.log(`Changes detected in ${selector}`, new Date().toISOString());
      deleteTagBoxes();
      injectTagBoxToSong();
    };
    let descriptionObserver = new MutationObserver(descriptionChanged);
    descriptionObserver.observe(element.querySelector(selector), config);
  });
};
function deleteTagBoxes() {
  const tagBoxWrappers = document.querySelectorAll('.tagbox');
  for (const element of tagBoxWrappers) {
    element.remove();
  }
}
function getSongId(href) {
  const regexp = /watch\?v=(.*?)\&/i;
  const result = href.match(regexp);
  return result[1];
}
function getPlaylistId(href) {
  const regexp = /list=([a-zA-Z0-9_-]+)/i;
  const result = href.match(regexp);
  return result[1];
}
})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
var __webpack_exports__ = {};
/*!**************************************!*\
  !*** ./components/TagBox/TagBox.css ***!
  \**************************************/
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
/*!****************************************!*\
  !*** ../options/js/playlistcreator.js ***!
  \****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _contentscript_TagService__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../contentscript/TagService */ "./TagService.ts");
/* harmony import */ var _contentscript_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../contentscript/logger */ "./logger.js");



$(document).ready(function() {
    _contentscript_TagService__WEBPACK_IMPORTED_MODULE_0__.TagService.getEndpoint().then((endpoint) => {
        let url = `${endpoint}/tags/ajayumasankar@gmail.com/`
        $('#tags').select2({
            ajax: {
                url: url,
                dataType: 'json',
                delay: 250, // wait 250 milliseconds before triggering the request
                data: function (params) {
                    var queryParameters = {
                        term: params.term ? params.term : ""
                    }
                    return queryParameters;
                },
                processResults: function (data) {
                    _contentscript_logger__WEBPACK_IMPORTED_MODULE_1__.logger.info(data)
                    return {
                        results: data.results
                    };
                },
            }
        });
    })    
});



})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLGFBQWEsbUJBQU8sQ0FBQyw2Q0FBTTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU8sR0FBRyxJQUFJO0FBQ3BDO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDcEJnQztBQUUxQixNQUFNQyxVQUFVLENBQUM7RUFDcEIsT0FBT0MsUUFBUSxHQUFXLHVCQUF1QjtFQUVqRCxhQUFhQyxXQUFXQSxDQUFBLEVBQUc7SUFDdkIsTUFBTUMsU0FBUyxHQUFJLEdBQUVILFVBQVUsQ0FBQ0MsUUFBUyxHQUFFO0lBQzNDLE1BQU1HLEdBQWEsR0FBRyxNQUFNSixVQUFVLENBQUNLLEdBQUcsQ0FBQ0YsU0FBUyxDQUFDO0lBQ3JELElBQUdDLEdBQUcsQ0FBQ0UsSUFBSSxJQUFJLE9BQU8sRUFBRTtNQUNwQlAsZ0RBQVcsQ0FBRSxtRkFBa0YsQ0FBQztNQUNoR0MsVUFBVSxDQUFDQyxRQUFRLEdBQUcsNENBQTRDO0lBQ3RFO0lBQ0EsT0FBTyxJQUFJLENBQUNBLFFBQVE7RUFDeEI7RUFFQSxhQUFhTyxPQUFPQSxDQUFDQyxTQUFpQixFQUFFQyxNQUFhLEVBQUVDLFFBQWUsRUFBRUMsVUFBaUIsRUFBRUMsWUFBbUIsRUFBRUMsUUFBZSxHQUFHLEVBQUUsRUFBNkI7SUFDN0pILFFBQVEsR0FBR0ksa0JBQWtCLENBQUNKLFFBQVEsQ0FBQztJQUN2QyxJQUFJSyxHQUFHLEdBQUksR0FBRWhCLFVBQVUsQ0FBQ0MsUUFBUyxTQUFRUSxTQUFVLElBQUdDLE1BQU8sYUFBWUksUUFBUyxjQUFhSCxRQUFTLGtCQUFpQkUsWUFBYSxnQkFBZUQsVUFBVyxFQUFDO0lBQ2pLO0lBQ0EsT0FBTyxNQUFNWixVQUFVLENBQUNLLEdBQUcsQ0FBQ1csR0FBRyxDQUFDLENBQUNDLElBQUksQ0FBQ2IsR0FBRyxJQUFJQSxHQUFHLENBQUNjLElBQUksRUFBRSxDQUFDLENBQ3ZERCxJQUFJLENBQUVFLE9BQU8sSUFBSztNQUNmLE1BQU1DLE9BQXdCLEdBQUcsSUFBSUMsR0FBRyxDQUFDQyxNQUFNLENBQUNDLE9BQU8sQ0FBQ0osT0FBTyxDQUFDLENBQUM7TUFDakVwQixnREFBVyxDQUFDLG1EQUFtRCxFQUFFb0IsT0FBTyxFQUFFQyxPQUFPLENBQUM7TUFDbEYsT0FBT0EsT0FBTztJQUNsQixDQUFDLENBQUM7RUFDTjtFQUNBLGFBQWFLLE1BQU1BLENBQUNoQixTQUFpQixFQUFFQyxNQUFhLEVBQUVnQixPQUFlLEVBQWdCO0lBQ2pGLE1BQU1WLEdBQUcsR0FBSSxHQUFFaEIsVUFBVSxDQUFDQyxRQUFTLFNBQVFRLFNBQVUsSUFBR0MsTUFBTyxJQUFHZ0IsT0FBUSxFQUFDO0lBQzNFLE9BQU8sTUFBTTFCLFVBQVUsQ0FBQzJCLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUNDLElBQUksQ0FBQ2IsR0FBRyxJQUFJQSxHQUFHLENBQUNjLElBQUksRUFBRSxDQUFDO0VBQzdEO0VBQ0EsYUFBYVUsU0FBU0EsQ0FBQ25CLFNBQWlCLEVBQUVDLE1BQWEsRUFBRWdCLE9BQWUsRUFBZ0I7SUFDcEYsTUFBTVYsR0FBRyxHQUFJLEdBQUVoQixVQUFVLENBQUNDLFFBQVMsU0FBUVEsU0FBVSxJQUFHQyxNQUFPLElBQUdnQixPQUFRLEVBQUM7SUFDM0UsT0FBTyxNQUFNMUIsVUFBVSxDQUFDNkIsTUFBTSxDQUFDYixHQUFHLENBQUMsQ0FBQ0MsSUFBSSxDQUFDYixHQUFHLElBQUlBLEdBQUcsQ0FBQ2MsSUFBSSxFQUFFLENBQUM7RUFDL0Q7RUFLQSxhQUFhYixHQUFHQSxDQUFDeUIsSUFBWSxFQUFxQjtJQUM5QyxNQUFNQyxNQUFtQixHQUFHO01BQ3hCQyxNQUFNLEVBQUUsS0FBSztNQUNiQyxRQUFRLEVBQUUsUUFBUTtNQUNsQkMsSUFBSSxFQUFFO0lBQ1YsQ0FBQztJQUNELE9BQU9sQyxVQUFVLENBQUNtQyxzQkFBc0IsQ0FBQ0wsSUFBSSxFQUFFQyxNQUFNLENBQUM7RUFDMUQ7RUFDQSxhQUFhSixJQUFJQSxDQUFDRyxJQUFZLEVBQUVNLElBQVUsRUFBcUI7SUFDM0QsTUFBTUwsTUFBbUIsR0FBRztNQUN4QkMsTUFBTSxFQUFFLE1BQU07TUFDZEMsUUFBUSxFQUFFLFFBQVE7TUFDbEJDLElBQUksRUFBRTtJQUNWLENBQUM7SUFDRCxJQUFJRSxJQUFJLEVBQUU7TUFDTkwsTUFBTSxDQUFDTSxPQUFPLEdBQUc7UUFDYixjQUFjLEVBQUU7TUFDcEIsQ0FBQztNQUNETixNQUFNLENBQUNLLElBQUksR0FBR0UsSUFBSSxDQUFDQyxTQUFTLENBQUNILElBQUksQ0FBQztJQUN0QztJQUNBLE9BQU9wQyxVQUFVLENBQUNtQyxzQkFBc0IsQ0FBQ0wsSUFBSSxFQUFFQyxNQUFNLENBQUM7RUFDMUQ7RUFDQSxhQUFhRixNQUFNQSxDQUFDQyxJQUFZLEVBQUVNLElBQVUsRUFBcUI7SUFDN0QsTUFBTUwsTUFBbUIsR0FBRztNQUN4QkMsTUFBTSxFQUFFLFFBQVE7TUFDaEJDLFFBQVEsRUFBRSxRQUFRO01BQ2xCQyxJQUFJLEVBQUU7SUFDVixDQUFDO0lBQ0QsSUFBSUUsSUFBSSxFQUFFO01BQ05MLE1BQU0sQ0FBQ00sT0FBTyxHQUFHO1FBQ2IsY0FBYyxFQUFFO01BQ3BCLENBQUM7TUFDRE4sTUFBTSxDQUFDSyxJQUFJLEdBQUdFLElBQUksQ0FBQ0MsU0FBUyxDQUFDSCxJQUFJLENBQUM7SUFDdEM7SUFDQSxPQUFPcEMsVUFBVSxDQUFDbUMsc0JBQXNCLENBQUNMLElBQUksRUFBRUMsTUFBTSxDQUFDO0VBQzFEO0VBQ0EsYUFBYUksc0JBQXNCQSxDQUFDTCxJQUFXLEVBQUVDLE1BQVUsRUFBRTtJQUN6RCxJQUFJO01BQ0EsTUFBTVMsUUFBa0IsR0FBRyxNQUFNQyxLQUFLLENBQUNYLElBQUksRUFBRUMsTUFBTSxDQUFDO01BQ3BELElBQUcsQ0FBQ1MsUUFBUSxDQUFDRSxFQUFFLEVBQUUsTUFBTUYsUUFBUTtNQUMvQixPQUFPQSxRQUFRO0lBQ25CLENBQUMsQ0FBQyxPQUFPRyxLQUFLLEVBQUU7TUFDWjVDLGdEQUFXLENBQUM0QyxLQUFLLEVBQUcsR0FBRVosTUFBTSxDQUFDQyxNQUFPLHVCQUFzQkYsSUFBSyxHQUFFLENBQUM7TUFDbEUsT0FBT2MsUUFBUSxDQUFDRCxLQUFLLEVBQUU7SUFDM0I7RUFDSjtBQUNKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyRjhDO0FBQ1Q7QUFFYTtBQUUzQyxNQUFNRyxHQUFHLENBQUM7RUFLYkMsV0FBV0EsQ0FBRUMsSUFBWSxFQUFFMUMsSUFBWSxHQUFHLFFBQVEsRUFBRTJDLElBQVksR0FBRyxJQUFJQyxJQUFJLEVBQUUsQ0FBQ0MsV0FBVyxFQUFFLEVBQUU7SUFDekYsSUFBSSxDQUFDSCxJQUFJLEdBQUdBLElBQUk7SUFDaEIsSUFBSSxDQUFDMUMsSUFBSSxHQUFHQSxJQUFJO0lBQ2hCLElBQUksQ0FBQzJDLElBQUksR0FBR0EsSUFBSTtJQUNoQixJQUFJLENBQUNHLFFBQVEsR0FBRyxHQUFHO0VBQ3ZCO0FBQ0o7QUFFTyxNQUFNQyxNQUFNLENBQUM7RUFLaEJDLEtBQUssR0FBR0MsUUFBUSxDQUFDQyxhQUFhLENBQUMsS0FBSyxDQUFDO0VBR3JDVCxXQUFXQSxDQUFFdEMsU0FBaUIsRUFBRUMsTUFBYSxFQUFFK0MsSUFBc0IsR0FBRyxJQUFJcEMsR0FBRyxFQUFlLEVBQUU7SUFDNUYsSUFBSSxDQUFDWixTQUFTLEdBQUdBLFNBQVM7SUFDMUIsSUFBSSxDQUFDQyxNQUFNLEdBQUdBLE1BQU07SUFDcEIsSUFBSSxDQUFDK0MsSUFBSSxHQUFHQSxJQUFJOztJQUVoQjtJQUNBLElBQUksQ0FBQ0gsS0FBSyxDQUFDSSxTQUFTLENBQUNDLEdBQUcsQ0FBQyxRQUFRLENBQUM7SUFDbEMsSUFBSSxDQUFDTCxLQUFLLENBQUNNLGdCQUFnQixDQUFDLE9BQU8sRUFBR0MsR0FBUSxJQUFLQSxHQUFHLENBQUNDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzRSxJQUFJLENBQUNSLEtBQUssQ0FBQ1MsU0FBUyxHQUNuQjtBQUNULHNCQUFzQmxCLGtGQUFxQjtBQUMzQyxvQ0FBb0MsR0FBR25DLE1BQU0sR0FBSTtBQUNqRCx5QkFBeUIsR0FBR0EsTUFBTSxHQUFJLFdBQVVtQyw2RUFBbUI7QUFDbkU7QUFDQSxTQUFTO0lBQ0QsSUFBSSxDQUFDbUIsT0FBTyxHQUFHLElBQUksQ0FBQ1YsS0FBSyxDQUFDVyxhQUFhLENBQUMsT0FBTyxDQUFxQixFQUNwRSxJQUFJLENBQUNELE9BQU8sQ0FBQ0osZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQ00sTUFBTSxDQUFDQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0lBRTlEO0lBQ0FWLElBQUksQ0FBQ1csT0FBTyxDQUFDQyxHQUFHLElBQUksSUFBSSxDQUFDQyxjQUFjLENBQUNELEdBQUcsQ0FBQyxDQUFDO0VBQ2pEO0VBRUEsTUFBTUgsTUFBTUEsQ0FBQ0ssQ0FBZSxFQUFFO0lBQzFCLElBQUlBLENBQUMsQ0FBQ0MsR0FBRyxLQUFLLE9BQU8sRUFBRTtJQUN2QixJQUFJUixPQUFPLEdBQUdPLENBQUMsQ0FBQ0UsTUFBMEI7SUFDMUMsSUFBSS9DLE9BQU8sR0FBR3NDLE9BQU8sQ0FBQ1UsS0FBSyxDQUFDQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztJQUNoRCxJQUFJTixHQUFRLEdBQUcsTUFBTXJFLDBEQUFpQixDQUFDLElBQUksQ0FBQ1MsU0FBUyxFQUFFLElBQUksQ0FBQ0MsTUFBTSxFQUFFZ0IsT0FBTyxDQUFDO0lBQzVFLElBQUcsSUFBSSxDQUFDK0IsSUFBSSxDQUFDbUIsR0FBRyxDQUFDUCxHQUFHLENBQUNyQixJQUFJLENBQUMsRUFBRTtJQUM1QmpELGdEQUFXLENBQUMsY0FBYyxFQUFFc0UsR0FBRyxDQUFDO0lBQ2hDLElBQUksQ0FBQ0MsY0FBYyxDQUFDRCxHQUFHLENBQUM7RUFDNUI7RUFFQUMsY0FBY0EsQ0FBQ0QsR0FBUSxFQUFFO0lBQ3JCLElBQUlRLFNBQTRCLEdBQUd0QixRQUFRLENBQUNDLGFBQWEsQ0FBQyxHQUFHLENBQUM7SUFDOURxQixTQUFTLENBQUNDLElBQUksR0FBRyxjQUFjO0lBQy9CRCxTQUFTLENBQUNuQixTQUFTLENBQUNDLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDL0JrQixTQUFTLENBQUNuQixTQUFTLENBQUNDLEdBQUcsQ0FBQ1UsR0FBRyxDQUFDL0QsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuQ3VFLFNBQVMsQ0FBQ2QsU0FBUyxHQUFJLEtBQUlNLEdBQUcsQ0FBQ3JCLElBQUssR0FBRTtJQUN0QyxJQUFJK0IsY0FBYyxHQUFHLElBQUksQ0FBQ25ELFNBQVMsQ0FBQ3VDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDOUNVLFNBQVMsQ0FBQ2pCLGdCQUFnQixDQUFDLE9BQU8sRUFBR0MsR0FBRyxJQUFLa0IsY0FBYyxDQUFDbEIsR0FBRyxFQUFFUSxHQUFHLENBQUNyQixJQUFJLENBQUMsQ0FBQztJQUMzRSxJQUFJLENBQUNNLEtBQUssQ0FBQzBCLHFCQUFxQixDQUFDLFlBQVksRUFBRUgsU0FBUyxDQUFDO0VBQzdEO0VBRUEsTUFBTWpELFNBQVNBLENBQUNpQyxHQUFjLEVBQUVuQyxPQUFlLEVBQUM7SUFDNUMsSUFBSXVELE9BQU8sR0FBR3BCLEdBQUcsQ0FBQ1ksTUFBaUI7SUFDbkNTLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLHVCQUF1QixFQUFFRixPQUFPLENBQUM7SUFDN0MsSUFBRyxDQUFDQSxPQUFPLEVBQUU7SUFDYixJQUFJLENBQUN4QixJQUFJLENBQUM1QixNQUFNLENBQUNILE9BQU8sQ0FBQztJQUN6QnVELE9BQU8sQ0FBQ0csTUFBTSxFQUFFO0lBQ2hCcEYsNkRBQW9CLENBQUMsSUFBSSxDQUFDUyxTQUFTLEVBQUUsSUFBSSxDQUFDQyxNQUFNLEVBQUVnQixPQUFPLENBQUM7RUFDOUQ7QUFDSjs7Ozs7Ozs7Ozs7Ozs7QUM3RUE7QUFDQSxpRUFBZSxDQUFDLHNFQUFzRTs7Ozs7Ozs7OztBQ0QxRTtBQUNaO0FBQ0EsUUFBUSwyQkFBMkIsV0FBVztBQUM5Qzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGFBQWE7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsU0FBUztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7OztBQzVHWTs7QUFFWixlQUFlLG1CQUFPLENBQUMsK0VBQXdCOztBQUUvQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx5REFBeUQ7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3Q0FBd0MsSUFBSSx3Q0FBd0M7O0FBRXBGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsaUJBQWlCOztBQUV2QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtB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LENBQUN5RCxnQkFBZ0IsQ0FBQyxTQUFTLENBQXdCO0VBQ2xGLEtBQUssTUFBTS9CLE9BQU8sSUFBSThELGNBQWMsRUFBRTtJQUNsQzlELE9BQU8sQ0FBQ0csTUFBTSxFQUFFO0VBQ3BCO0FBQ0o7QUFFQSxTQUFTb0IsU0FBU0EsQ0FBQzFCLElBQVksRUFBRTtFQUM3QixNQUFNa0UsTUFBYyxHQUFHLG1CQUFtQjtFQUMxQyxNQUFNQyxNQUF3QixHQUFHbkUsSUFBSSxDQUFDb0UsS0FBSyxDQUFDRixNQUFNLENBQXFCO0VBQ3ZFLE9BQU9DLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDcEI7QUFFQSxTQUFTdkMsYUFBYUEsQ0FBQzVCLElBQVksRUFBRTtFQUNqQyxNQUFNa0UsTUFBYyxHQUFHLHdCQUF3QjtFQUMvQyxNQUFNQyxNQUF3QixHQUFHbkUsSUFBSSxDQUFDb0UsS0FBSyxDQUFDRixNQUFNLENBQXFCO0VBQ3ZFLE9BQU9DLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDcEIsQzs7Ozs7Ozs7OztBQzNJQTs7Ozs7Ozs7Ozs7O0FDQTREO0FBQ1I7QUFDcEQ7QUFDQTtBQUNBLElBQUksNkVBQXNCO0FBQzFCLHFCQUFxQixTQUFTO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0Esb0JBQW9CLDhEQUFXO0FBQy9CO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0wsQ0FBQztBQUNEO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9sb2dnZXIuanMiLCJ3ZWJwYWNrOi8vLy4vVGFnU2VydmljZS50cyIsIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL1RhZ0JveC9UYWdCb3gudHMiLCJ3ZWJwYWNrOi8vLy4vY29tcG9uZW50cy9UYWdCb3gvVGFnQm94QWRkQnV0dG9uLm1vZHVsZS5zY3NzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvcXVpY2stZm9ybWF0LXVuZXNjYXBlZC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi4vbm9kZV9tb2R1bGVzL3Bpbm8vYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9UYWdCb3hJbmplY3Rvci50cyIsIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL1RhZ0JveC9UYWdCb3guY3NzIiwid2VicGFjazovLy8uLi9vcHRpb25zL2pzL3BsYXlsaXN0Y3JlYXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwaW5vID0gcmVxdWlyZShcInBpbm9cIik7XHJcblxyXG5jb25zdCBsZXZlbCA9IFwiZGVidWdcIjtcclxuY29uc3QgcHJldHR5UHJpbnQgPSB7XHJcblx0Y29sb3JpemU6IFwidHJ1ZVwiLCAvLyAtLWNvbG9yaXplOiBhZGQgdGVybWluYWwgY29sb3IgZXNjYXBlIHNlcXVlbmNlIHRvIHRoZSBvdXRwdXRcclxuXHRsZXZlbEZpcnN0OiB0cnVlLCAvLyAtLWxldmVsRmlyc3Q6IGRpc3BsYXkgdGhlIGxvZyBsZXZlbCBuYW1lIGJlZm9yZSB0aGUgbG9nZ2VkIGRhdGUgYW5kIHRpbWVcclxuXHR0cmFuc2xhdGVUaW1lOiBcIlNZUzpzdGFuZGFyZFwiLCAvLyAtLXRyYW5zbGF0ZVRpbWU6IHRyYW5zbGF0ZSB0aGUgZXBvY2ggdGltZSB0byBsb2NhbCBzeXN0ZW0ncyBUWiwgaW4gaHVtYW4gcmVhZGFibGUgZm9ybWF0XHJcblx0aWdub3JlOiBcInBpZCxob3N0bmFtZSxtb2R1bGVcIiAvLyAtLWlnbm9yZTogaWdub3JlIG9uZSBvciBzZXZlcmFsIGtleXNcclxuXHQvLyBzaW5nbGVMaW5lOiB0cnVlLCAvLyAtLXNpbmdsZUxpbmU6IHByaW50IGVhY2ggbG9nIG1lc3NhZ2Ugb24gYSBzaW5nbGUgbGluZVxyXG5cdC8vIG1lc3NhZ2VGb3JtYXQ6IFwiKHttb2R1bGV9KSB7bXNnfVwiIC8vIC0tbWVzc2FnZUZvcm1hdDogZm9ybWF0IG91dHBvdXQgZm9yIHRoZSBtZXNzYWdlIHBvcnRpb24gb2YgdGhlIGxvZ1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGxvZ2dlciA9IHBpbm8oe1xyXG5cdG5hbWU6IFwic2VydmVyXCIsXHJcblx0bGV2ZWw6IFwiZGVidWdcIixcclxuXHRmb3JtYXR0ZXJzOiB7XHJcblx0XHRsZXZlbChsYWJlbCkge1xyXG5cdFx0XHRyZXR1cm4geyBsZXZlbDogbGFiZWwgfTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdHByZXR0eVByaW50OiBwcmV0dHlQcmludFxyXG59KSIsImltcG9ydCB7IFRhZyB9IGZyb20gJy4vY29tcG9uZW50cy9UYWdCb3gvVGFnQm94J1xyXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL2xvZ2dlcidcclxuXHJcbmV4cG9ydCBjbGFzcyBUYWdTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyBlbmRwb2ludDogc3RyaW5nID0gXCJodHRwOi8vbG9jYWxob3N0OjgwMDBcIlxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRFbmRwb2ludCgpIHtcclxuICAgICAgICBjb25zdCBoZWFsdGhVcmwgPSBgJHtUYWdTZXJ2aWNlLmVuZHBvaW50fS9gXHJcbiAgICAgICAgY29uc3QgcmVzOiBSZXNwb25zZSA9IGF3YWl0IFRhZ1NlcnZpY2UuZ2V0KGhlYWx0aFVybClcclxuICAgICAgICBpZihyZXMudHlwZSA9PSBcImVycm9yXCIpIHtcclxuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYExvY2FsIEFQSSBub3QgZm91bmQsIHVzaW5nIFJhaWx3YXkgYXQ6IGh0dHBzOi8vc29uZ3RhZ3MtcHJvZHVjdGlvbi51cC5yYWlsd2F5LmFwcGApXHJcbiAgICAgICAgICAgIFRhZ1NlcnZpY2UuZW5kcG9pbnQgPSBcImh0dHBzOi8vc29uZ3RhZ3MtcHJvZHVjdGlvbi51cC5yYWlsd2F5LmFwcFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5lbmRwb2ludDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0VGFncyh1c2VyRW1haWw6IHN0cmluZywgc29uZ0lkOnN0cmluZywgc29uZ05hbWU6c3RyaW5nLCBwbGF5bGlzdElkOnN0cmluZywgcGxheWxpc3ROYW1lOnN0cmluZywgdXBsb2FkZXI6c3RyaW5nID0gXCJcIik6IFByb21pc2U8TWFwPHN0cmluZywgVGFnPj4ge1xyXG4gICAgICAgIHNvbmdOYW1lID0gZW5jb2RlVVJJQ29tcG9uZW50KHNvbmdOYW1lKVxyXG4gICAgICAgIHZhciB1cmwgPSBgJHtUYWdTZXJ2aWNlLmVuZHBvaW50fS90YWdzLyR7dXNlckVtYWlsfS8ke3NvbmdJZH0/dXBsb2FkZXI9JHt1cGxvYWRlcn0mc29uZ19uYW1lPSR7c29uZ05hbWV9JnBsYXlsaXN0X25hbWU9JHtwbGF5bGlzdE5hbWV9JnBsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gXHJcbiAgICAgICAgLy8gdXJsID0gZW5jb2RlVVJJKHVybCkgLy8gb3IgZWxzZSAjIGluIHNvbmduYW1lIHdpbGwgYnJlYWtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVGFnU2VydmljZS5nZXQodXJsKS50aGVuKHJlcyA9PiByZXMuanNvbigpKVxyXG4gICAgICAgIC50aGVuKCh0YWdzT2JqKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhZ3NNYXA6IE1hcDxzdHJpbmcsVGFnPiA9IG5ldyBNYXAoT2JqZWN0LmVudHJpZXModGFnc09iaikpO1xyXG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhcIlJlY2lldmVkIHRhZ3NPYmogd2hpY2ggd2FzIGNvbnZlcnRlZCBpbnRvIHRhZ3NNYXBcIiwgdGFnc09iaiwgdGFnc01hcClcclxuICAgICAgICAgICAgcmV0dXJuIHRhZ3NNYXBcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGFzeW5jIHNldFRhZyh1c2VyRW1haWw6IHN0cmluZywgc29uZ0lkOnN0cmluZywgdGFnTmFtZTogc3RyaW5nKTogUHJvbWlzZTxUYWc+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSBgJHtUYWdTZXJ2aWNlLmVuZHBvaW50fS90YWdzLyR7dXNlckVtYWlsfS8ke3NvbmdJZH0vJHt0YWdOYW1lfWBcclxuICAgICAgICByZXR1cm4gYXdhaXQgVGFnU2VydmljZS5wb3N0KHVybCkudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcclxuICAgIH1cclxuICAgIHN0YXRpYyBhc3luYyBkZWxldGVUYWcodXNlckVtYWlsOiBzdHJpbmcsIHNvbmdJZDpzdHJpbmcsIHRhZ05hbWU6IHN0cmluZyk6IFByb21pc2U8VGFnPiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYCR7VGFnU2VydmljZS5lbmRwb2ludH0vdGFncy8ke3VzZXJFbWFpbH0vJHtzb25nSWR9LyR7dGFnTmFtZX1gXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFRhZ1NlcnZpY2UuZGVsZXRlKHVybCkudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0KHBhdGg6IHN0cmluZyk6IFByb21pc2U8UmVzcG9uc2U+IHtcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlcXVlc3RJbml0ID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXHJcbiAgICAgICAgICAgIG1vZGU6ICdjb3JzJyBhcyBSZXF1ZXN0TW9kZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIFRhZ1NlcnZpY2UuZmV0Y2hXaXRoRXJyb3JIYW5kbGluZyhwYXRoLCBwYXJhbXMpXHJcbiAgICB9XHJcbiAgICBzdGF0aWMgYXN5bmMgcG9zdChwYXRoOiBzdHJpbmcsIGJvZHk/OiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgY29uc3QgcGFyYW1zOiBSZXF1ZXN0SW5pdCA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxyXG4gICAgICAgICAgICBtb2RlOiAnY29ycycgYXMgUmVxdWVzdE1vZGVcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChib2R5KSB7XHJcbiAgICAgICAgICAgIHBhcmFtcy5oZWFkZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHBhcmFtcy5ib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBUYWdTZXJ2aWNlLmZldGNoV2l0aEVycm9ySGFuZGxpbmcocGF0aCwgcGFyYW1zKVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGFzeW5jIGRlbGV0ZShwYXRoOiBzdHJpbmcsIGJvZHk/OiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgY29uc3QgcGFyYW1zOiBSZXF1ZXN0SW5pdCA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxyXG4gICAgICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXHJcbiAgICAgICAgICAgIG1vZGU6ICdjb3JzJyBhcyBSZXF1ZXN0TW9kZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKGJvZHkpIHtcclxuICAgICAgICAgICAgcGFyYW1zLmhlYWRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcGFyYW1zLmJvZHkgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFRhZ1NlcnZpY2UuZmV0Y2hXaXRoRXJyb3JIYW5kbGluZyhwYXRoLCBwYXJhbXMpXHJcbiAgICB9XHJcbiAgICBzdGF0aWMgYXN5bmMgZmV0Y2hXaXRoRXJyb3JIYW5kbGluZyhwYXRoOnN0cmluZywgcGFyYW1zOmFueSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlOiBSZXNwb25zZSA9IGF3YWl0IGZldGNoKHBhdGgsIHBhcmFtcyk7XHJcbiAgICAgICAgICAgIGlmKCFyZXNwb25zZS5vaykgdGhyb3cgcmVzcG9uc2VcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGVycm9yLCBgJHtwYXJhbXMubWV0aG9kfSByZXF1ZXN0IGZhaWxlZCBmb3IgJHtwYXRofSFgKVxyXG4gICAgICAgICAgICByZXR1cm4gUmVzcG9uc2UuZXJyb3IoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgVGFnU2VydmljZSB9IGZyb20gJy4uLy4uL1RhZ1NlcnZpY2UnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vLi4vbG9nZ2VyJ1xuXG5pbXBvcnQgc3R5bGVzIGZyb20gXCIuL1RhZ0JveEFkZEJ1dHRvbi5tb2R1bGUuc2Nzc1wiXG5cbmV4cG9ydCBjbGFzcyBUYWcge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgZGF0ZTogc3RyaW5nO1xuICAgIHByaW9yaXR5OiBudW1iZXI7XG4gICAgY29uc3RydWN0b3IgKG5hbWU6IHN0cmluZywgdHlwZTogc3RyaW5nID0gXCJub3JtYWxcIiwgZGF0ZTogc3RyaW5nID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuZGF0ZSA9IGRhdGU7XG4gICAgICAgIHRoaXMucHJpb3JpdHkgPSA1MDBcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUYWdCb3gge1xuICAgIHVzZXJFbWFpbDogc3RyaW5nO1xuICAgIHNvbmdJZDogc3RyaW5nO1xuICAgIHRhZ3M6IE1hcDxzdHJpbmcsIFRhZz47XG5cbiAgICBkaXZFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGlucHV0RWw6IEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3RvciAodXNlckVtYWlsOiBzdHJpbmcsIHNvbmdJZDpzdHJpbmcsIHRhZ3M6IE1hcDxzdHJpbmcsIFRhZz4gPSBuZXcgTWFwPHN0cmluZywgVGFnPigpKSB7XG4gICAgICAgIHRoaXMudXNlckVtYWlsID0gdXNlckVtYWlsXG4gICAgICAgIHRoaXMuc29uZ0lkID0gc29uZ0lkXG4gICAgICAgIHRoaXMudGFncyA9IHRhZ3NcblxuICAgICAgICAvLyBTZXR1cCB0aGUgZGl2IGFuZCBpbnB1dCBlbGVtZW50IFxuICAgICAgICB0aGlzLmRpdkVsLmNsYXNzTGlzdC5hZGQoXCJ0YWdib3hcIik7XG4gICAgICAgIHRoaXMuZGl2RWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldnQ6IGFueSkgPT4gZXZ0LnN0b3BQcm9wYWdhdGlvbigpKTsgLy8gT3IgZWxzZSB3ZSB0cmlnZ2VyIHlvdXR1YmVzIGNsaWNrIGhhbmRsZXIgYW5kIGVudGVyIHRoZSBzb25nIG9uIHBsYXlsaXN0IHBhZ2VcbiAgICAgICAgdGhpcy5kaXZFbC5pbm5lckhUTUwgPSBcbiAgICAgICAgYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtzdHlsZXNbJ3RleHQtaW5wdXQnXX1cIj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiYCArIHNvbmdJZCArIGBcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJgICsgc29uZ0lkICsgYFwiIGNsYXNzPSR7c3R5bGVzWyd0YWdsYWJlbCddfT4rPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIGBcbiAgICAgICAgdGhpcy5pbnB1dEVsID0gdGhpcy5kaXZFbC5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIikgYXMgSFRNTElucHV0RWxlbWVudCxcbiAgICAgICAgdGhpcy5pbnB1dEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCB0aGlzLmFkZFRhZy5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvLyBGaXJzdCByZW5kZXIgb2YgdGhlIHRhZ3NcbiAgICAgICAgdGFncy5mb3JFYWNoKHRhZyA9PiB0aGlzLmFkZFRhZ0Zyb250ZW5kKHRhZykpXG4gICAgfVxuXG4gICAgYXN5bmMgYWRkVGFnKGU6S2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBpZiAoZS5rZXkgIT09ICdFbnRlcicpIHJldHVybjtcbiAgICAgICAgbGV0IGlucHV0RWwgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICBsZXQgdGFnTmFtZSA9IGlucHV0RWwudmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgICBsZXQgdGFnOiBUYWcgPSBhd2FpdCBUYWdTZXJ2aWNlLnNldFRhZyh0aGlzLnVzZXJFbWFpbCwgdGhpcy5zb25nSWQsIHRhZ05hbWUpIFxuICAgICAgICBpZih0aGlzLnRhZ3MuaGFzKHRhZy5uYW1lKSkgcmV0dXJuXG4gICAgICAgIGxvZ2dlci5pbmZvKFwiQWRkaW5nIHRhZzogXCIsIHRhZylcbiAgICAgICAgdGhpcy5hZGRUYWdGcm9udGVuZCh0YWcpXG4gICAgfVxuXG4gICAgYWRkVGFnRnJvbnRlbmQodGFnOiBUYWcpIHtcbiAgICAgICAgbGV0IGFuY2hvclRhZzogSFRNTEFuY2hvckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGFuY2hvclRhZy5ocmVmID0gXCJqYXZhc2NyaXB0OjtcIjtcbiAgICAgICAgYW5jaG9yVGFnLmNsYXNzTGlzdC5hZGQoXCJwaWxsXCIpO1xuICAgICAgICBhbmNob3JUYWcuY2xhc3NMaXN0LmFkZCh0YWcudHlwZSk7IC8vIHdpbGwgYmUgdXNlZCB0byBnaXZlIGRpZmZlcmVudCBjb2xvciB0byB0YWdzXG4gICAgICAgIGFuY2hvclRhZy5pbm5lckhUTUwgPSBgXFwjJHt0YWcubmFtZX0gYFxuICAgICAgICBsZXQgZGVsZXRlVGFnQm91bmQgPSB0aGlzLmRlbGV0ZVRhZy5iaW5kKHRoaXMpO1xuICAgICAgICBhbmNob3JUYWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZ0KSA9PiBkZWxldGVUYWdCb3VuZChldnQsIHRhZy5uYW1lKSk7XG4gICAgICAgIHRoaXMuZGl2RWwuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYWZ0ZXJiZWdpblwiLCBhbmNob3JUYWcpO1xuICAgIH1cblxuICAgIGFzeW5jIGRlbGV0ZVRhZyhldnQ6TW91c2VFdmVudCwgdGFnTmFtZTogc3RyaW5nKXtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBldnQudGFyZ2V0IGFzIEVsZW1lbnQ7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmluZyB0YWcgZWxlbWVudDonLCBlbGVtZW50KTtcbiAgICAgICAgaWYoIWVsZW1lbnQpIHJldHVybjtcbiAgICAgICAgdGhpcy50YWdzLmRlbGV0ZSh0YWdOYW1lKVxuICAgICAgICBlbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICBUYWdTZXJ2aWNlLmRlbGV0ZVRhZyh0aGlzLnVzZXJFbWFpbCwgdGhpcy5zb25nSWQsIHRhZ05hbWUpO1xuICAgIH1cbn0iLCIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCBkZWZhdWx0IHtcInRleHQtaW5wdXRcIjpcInlJS2Rhd2NaR2l6ZmhTcFBHRE9HXCIsXCJ0YWdsYWJlbFwiOlwiSVJWNjNjNEtmNTJ0VzdMNTNldldcIn07IiwiJ3VzZSBzdHJpY3QnXG5mdW5jdGlvbiB0cnlTdHJpbmdpZnkgKG8pIHtcbiAgdHJ5IHsgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG8pIH0gY2F0Y2goZSkgeyByZXR1cm4gJ1wiW0NpcmN1bGFyXVwiJyB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZm9ybWF0XG5cbmZ1bmN0aW9uIGZvcm1hdChmLCBhcmdzLCBvcHRzKSB7XG4gIHZhciBzcyA9IChvcHRzICYmIG9wdHMuc3RyaW5naWZ5KSB8fCB0cnlTdHJpbmdpZnlcbiAgdmFyIG9mZnNldCA9IDFcbiAgaWYgKHR5cGVvZiBmID09PSAnb2JqZWN0JyAmJiBmICE9PSBudWxsKSB7XG4gICAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoICsgb2Zmc2V0XG4gICAgaWYgKGxlbiA9PT0gMSkgcmV0dXJuIGZcbiAgICB2YXIgb2JqZWN0cyA9IG5ldyBBcnJheShsZW4pXG4gICAgb2JqZWN0c1swXSA9IHNzKGYpXG4gICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGxlbjsgaW5kZXgrKykge1xuICAgICAgb2JqZWN0c1tpbmRleF0gPSBzcyhhcmdzW2luZGV4XSlcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpXG4gIH1cbiAgaWYgKHR5cGVvZiBmICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmXG4gIH1cbiAgdmFyIGFyZ0xlbiA9IGFyZ3MubGVuZ3RoXG4gIGlmIChhcmdMZW4gPT09IDApIHJldHVybiBmXG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgYSA9IDEgLSBvZmZzZXRcbiAgdmFyIGxhc3RQb3MgPSAtMVxuICB2YXIgZmxlbiA9IChmICYmIGYubGVuZ3RoKSB8fCAwXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZmxlbjspIHtcbiAgICBpZiAoZi5jaGFyQ29kZUF0KGkpID09PSAzNyAmJiBpICsgMSA8IGZsZW4pIHtcbiAgICAgIGxhc3RQb3MgPSBsYXN0UG9zID4gLTEgPyBsYXN0UG9zIDogMFxuICAgICAgc3dpdGNoIChmLmNoYXJDb2RlQXQoaSArIDEpKSB7XG4gICAgICAgIGNhc2UgMTAwOiAvLyAnZCdcbiAgICAgICAgY2FzZSAxMDI6IC8vICdmJ1xuICAgICAgICAgIGlmIChhID49IGFyZ0xlbilcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgaWYgKGFyZ3NbYV0gPT0gbnVsbCkgIGJyZWFrXG4gICAgICAgICAgaWYgKGxhc3RQb3MgPCBpKVxuICAgICAgICAgICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcywgaSlcbiAgICAgICAgICBzdHIgKz0gTnVtYmVyKGFyZ3NbYV0pXG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgaSsrXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAxMDU6IC8vICdpJ1xuICAgICAgICAgIGlmIChhID49IGFyZ0xlbilcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgaWYgKGFyZ3NbYV0gPT0gbnVsbCkgIGJyZWFrXG4gICAgICAgICAgaWYgKGxhc3RQb3MgPCBpKVxuICAgICAgICAgICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcywgaSlcbiAgICAgICAgICBzdHIgKz0gTWF0aC5mbG9vcihOdW1iZXIoYXJnc1thXSkpXG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgaSsrXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA3OTogLy8gJ08nXG4gICAgICAgIGNhc2UgMTExOiAvLyAnbydcbiAgICAgICAgY2FzZSAxMDY6IC8vICdqJ1xuICAgICAgICAgIGlmIChhID49IGFyZ0xlbilcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgaWYgKGFyZ3NbYV0gPT09IHVuZGVmaW5lZCkgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGFyZ3NbYV1cbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHN0ciArPSAnXFwnJyArIGFyZ3NbYV0gKyAnXFwnJ1xuICAgICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBzdHIgKz0gYXJnc1thXS5uYW1lIHx8ICc8YW5vbnltb3VzPidcbiAgICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdHIgKz0gc3MoYXJnc1thXSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDExNTogLy8gJ3MnXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSBTdHJpbmcoYXJnc1thXSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM3OiAvLyAnJSdcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSAnJSdcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBhLS1cbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgKythXG4gICAgfVxuICAgICsraVxuICB9XG4gIGlmIChsYXN0UG9zID09PSAtMSlcbiAgICByZXR1cm4gZlxuICBlbHNlIGlmIChsYXN0UG9zIDwgZmxlbikge1xuICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MpXG4gIH1cblxuICByZXR1cm4gc3RyXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZm9ybWF0ID0gcmVxdWlyZSgncXVpY2stZm9ybWF0LXVuZXNjYXBlZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gcGlub1xuXG5jb25zdCBfY29uc29sZSA9IHBmR2xvYmFsVGhpc09yRmFsbGJhY2soKS5jb25zb2xlIHx8IHt9XG5jb25zdCBzdGRTZXJpYWxpemVycyA9IHtcbiAgbWFwSHR0cFJlcXVlc3Q6IG1vY2ssXG4gIG1hcEh0dHBSZXNwb25zZTogbW9jayxcbiAgd3JhcFJlcXVlc3RTZXJpYWxpemVyOiBwYXNzdGhyb3VnaCxcbiAgd3JhcFJlc3BvbnNlU2VyaWFsaXplcjogcGFzc3Rocm91Z2gsXG4gIHdyYXBFcnJvclNlcmlhbGl6ZXI6IHBhc3N0aHJvdWdoLFxuICByZXE6IG1vY2ssXG4gIHJlczogbW9jayxcbiAgZXJyOiBhc0VyclZhbHVlXG59XG5cbmZ1bmN0aW9uIHNob3VsZFNlcmlhbGl6ZSAoc2VyaWFsaXplLCBzZXJpYWxpemVycykge1xuICBpZiAoQXJyYXkuaXNBcnJheShzZXJpYWxpemUpKSB7XG4gICAgY29uc3QgaGFzVG9GaWx0ZXIgPSBzZXJpYWxpemUuZmlsdGVyKGZ1bmN0aW9uIChrKSB7XG4gICAgICByZXR1cm4gayAhPT0gJyFzdGRTZXJpYWxpemVycy5lcnInXG4gICAgfSlcbiAgICByZXR1cm4gaGFzVG9GaWx0ZXJcbiAgfSBlbHNlIGlmIChzZXJpYWxpemUgPT09IHRydWUpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2VyaWFsaXplcnMpXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gcGlubyAob3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fVxuICBvcHRzLmJyb3dzZXIgPSBvcHRzLmJyb3dzZXIgfHwge31cblxuICBjb25zdCB0cmFuc21pdCA9IG9wdHMuYnJvd3Nlci50cmFuc21pdFxuICBpZiAodHJhbnNtaXQgJiYgdHlwZW9mIHRyYW5zbWl0LnNlbmQgIT09ICdmdW5jdGlvbicpIHsgdGhyb3cgRXJyb3IoJ3Bpbm86IHRyYW5zbWl0IG9wdGlvbiBtdXN0IGhhdmUgYSBzZW5kIGZ1bmN0aW9uJykgfVxuXG4gIGNvbnN0IHByb3RvID0gb3B0cy5icm93c2VyLndyaXRlIHx8IF9jb25zb2xlXG4gIGlmIChvcHRzLmJyb3dzZXIud3JpdGUpIG9wdHMuYnJvd3Nlci5hc09iamVjdCA9IHRydWVcbiAgY29uc3Qgc2VyaWFsaXplcnMgPSBvcHRzLnNlcmlhbGl6ZXJzIHx8IHt9XG4gIGNvbnN0IHNlcmlhbGl6ZSA9IHNob3VsZFNlcmlhbGl6ZShvcHRzLmJyb3dzZXIuc2VyaWFsaXplLCBzZXJpYWxpemVycylcbiAgbGV0IHN0ZEVyclNlcmlhbGl6ZSA9IG9wdHMuYnJvd3Nlci5zZXJpYWxpemVcblxuICBpZiAoXG4gICAgQXJyYXkuaXNBcnJheShvcHRzLmJyb3dzZXIuc2VyaWFsaXplKSAmJlxuICAgIG9wdHMuYnJvd3Nlci5zZXJpYWxpemUuaW5kZXhPZignIXN0ZFNlcmlhbGl6ZXJzLmVycicpID4gLTFcbiAgKSBzdGRFcnJTZXJpYWxpemUgPSBmYWxzZVxuXG4gIGNvbnN0IGxldmVscyA9IFsnZXJyb3InLCAnZmF0YWwnLCAnd2FybicsICdpbmZvJywgJ2RlYnVnJywgJ3RyYWNlJ11cblxuICBpZiAodHlwZW9mIHByb3RvID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcHJvdG8uZXJyb3IgPSBwcm90by5mYXRhbCA9IHByb3RvLndhcm4gPVxuICAgIHByb3RvLmluZm8gPSBwcm90by5kZWJ1ZyA9IHByb3RvLnRyYWNlID0gcHJvdG9cbiAgfVxuICBpZiAob3B0cy5lbmFibGVkID09PSBmYWxzZSB8fCBvcHRzLmJyb3dzZXIuZGlzYWJsZWQpIG9wdHMubGV2ZWwgPSAnc2lsZW50J1xuICBjb25zdCBsZXZlbCA9IG9wdHMubGV2ZWwgfHwgJ2luZm8nXG4gIGNvbnN0IGxvZ2dlciA9IE9iamVjdC5jcmVhdGUocHJvdG8pXG4gIGlmICghbG9nZ2VyLmxvZykgbG9nZ2VyLmxvZyA9IG5vb3BcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nZ2VyLCAnbGV2ZWxWYWwnLCB7XG4gICAgZ2V0OiBnZXRMZXZlbFZhbFxuICB9KVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nZ2VyLCAnbGV2ZWwnLCB7XG4gICAgZ2V0OiBnZXRMZXZlbCxcbiAgICBzZXQ6IHNldExldmVsXG4gIH0pXG5cbiAgY29uc3Qgc2V0T3B0cyA9IHtcbiAgICB0cmFuc21pdCxcbiAgICBzZXJpYWxpemUsXG4gICAgYXNPYmplY3Q6IG9wdHMuYnJvd3Nlci5hc09iamVjdCxcbiAgICBsZXZlbHMsXG4gICAgdGltZXN0YW1wOiBnZXRUaW1lRnVuY3Rpb24ob3B0cylcbiAgfVxuICBsb2dnZXIubGV2ZWxzID0gcGluby5sZXZlbHNcbiAgbG9nZ2VyLmxldmVsID0gbGV2ZWxcblxuICBsb2dnZXIuc2V0TWF4TGlzdGVuZXJzID0gbG9nZ2VyLmdldE1heExpc3RlbmVycyA9XG4gIGxvZ2dlci5lbWl0ID0gbG9nZ2VyLmFkZExpc3RlbmVyID0gbG9nZ2VyLm9uID1cbiAgbG9nZ2VyLnByZXBlbmRMaXN0ZW5lciA9IGxvZ2dlci5vbmNlID1cbiAgbG9nZ2VyLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBsb2dnZXIucmVtb3ZlTGlzdGVuZXIgPVxuICBsb2dnZXIucmVtb3ZlQWxsTGlzdGVuZXJzID0gbG9nZ2VyLmxpc3RlbmVycyA9XG4gIGxvZ2dlci5saXN0ZW5lckNvdW50ID0gbG9nZ2VyLmV2ZW50TmFtZXMgPVxuICBsb2dnZXIud3JpdGUgPSBsb2dnZXIuZmx1c2ggPSBub29wXG4gIGxvZ2dlci5zZXJpYWxpemVycyA9IHNlcmlhbGl6ZXJzXG4gIGxvZ2dlci5fc2VyaWFsaXplID0gc2VyaWFsaXplXG4gIGxvZ2dlci5fc3RkRXJyU2VyaWFsaXplID0gc3RkRXJyU2VyaWFsaXplXG4gIGxvZ2dlci5jaGlsZCA9IGNoaWxkXG5cbiAgaWYgKHRyYW5zbWl0KSBsb2dnZXIuX2xvZ0V2ZW50ID0gY3JlYXRlTG9nRXZlbnRTaGFwZSgpXG5cbiAgZnVuY3Rpb24gZ2V0TGV2ZWxWYWwgKCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsID09PSAnc2lsZW50J1xuICAgICAgPyBJbmZpbml0eVxuICAgICAgOiB0aGlzLmxldmVscy52YWx1ZXNbdGhpcy5sZXZlbF1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExldmVsICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGV2ZWxcbiAgfVxuICBmdW5jdGlvbiBzZXRMZXZlbCAobGV2ZWwpIHtcbiAgICBpZiAobGV2ZWwgIT09ICdzaWxlbnQnICYmICF0aGlzLmxldmVscy52YWx1ZXNbbGV2ZWxdKSB7XG4gICAgICB0aHJvdyBFcnJvcigndW5rbm93biBsZXZlbCAnICsgbGV2ZWwpXG4gICAgfVxuICAgIHRoaXMuX2xldmVsID0gbGV2ZWxcblxuICAgIHNldChzZXRPcHRzLCBsb2dnZXIsICdlcnJvcicsICdsb2cnKSAvLyA8LS0gbXVzdCBzdGF5IGZpcnN0XG4gICAgc2V0KHNldE9wdHMsIGxvZ2dlciwgJ2ZhdGFsJywgJ2Vycm9yJylcbiAgICBzZXQoc2V0T3B0cywgbG9nZ2VyLCAnd2FybicsICdlcnJvcicpXG4gICAgc2V0KHNldE9wdHMsIGxvZ2dlciwgJ2luZm8nLCAnbG9nJylcbiAgICBzZXQoc2V0T3B0cywgbG9nZ2VyLCAnZGVidWcnLCAnbG9nJylcbiAgICBzZXQoc2V0T3B0cywgbG9nZ2VyLCAndHJhY2UnLCAnbG9nJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoaWxkIChiaW5kaW5ncywgY2hpbGRPcHRpb25zKSB7XG4gICAgaWYgKCFiaW5kaW5ncykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGJpbmRpbmdzIGZvciBjaGlsZCBQaW5vJylcbiAgICB9XG4gICAgY2hpbGRPcHRpb25zID0gY2hpbGRPcHRpb25zIHx8IHt9XG4gICAgaWYgKHNlcmlhbGl6ZSAmJiBiaW5kaW5ncy5zZXJpYWxpemVycykge1xuICAgICAgY2hpbGRPcHRpb25zLnNlcmlhbGl6ZXJzID0gYmluZGluZ3Muc2VyaWFsaXplcnNcbiAgICB9XG4gICAgY29uc3QgY2hpbGRPcHRpb25zU2VyaWFsaXplcnMgPSBjaGlsZE9wdGlvbnMuc2VyaWFsaXplcnNcbiAgICBpZiAoc2VyaWFsaXplICYmIGNoaWxkT3B0aW9uc1NlcmlhbGl6ZXJzKSB7XG4gICAgICB2YXIgY2hpbGRTZXJpYWxpemVycyA9IE9iamVjdC5hc3NpZ24oe30sIHNlcmlhbGl6ZXJzLCBjaGlsZE9wdGlvbnNTZXJpYWxpemVycylcbiAgICAgIHZhciBjaGlsZFNlcmlhbGl6ZSA9IG9wdHMuYnJvd3Nlci5zZXJpYWxpemUgPT09IHRydWVcbiAgICAgICAgPyBPYmplY3Qua2V5cyhjaGlsZFNlcmlhbGl6ZXJzKVxuICAgICAgICA6IHNlcmlhbGl6ZVxuICAgICAgZGVsZXRlIGJpbmRpbmdzLnNlcmlhbGl6ZXJzXG4gICAgICBhcHBseVNlcmlhbGl6ZXJzKFtiaW5kaW5nc10sIGNoaWxkU2VyaWFsaXplLCBjaGlsZFNlcmlhbGl6ZXJzLCB0aGlzLl9zdGRFcnJTZXJpYWxpemUpXG4gICAgfVxuICAgIGZ1bmN0aW9uIENoaWxkIChwYXJlbnQpIHtcbiAgICAgIHRoaXMuX2NoaWxkTGV2ZWwgPSAocGFyZW50Ll9jaGlsZExldmVsIHwgMCkgKyAxXG4gICAgICB0aGlzLmVycm9yID0gYmluZChwYXJlbnQsIGJpbmRpbmdzLCAnZXJyb3InKVxuICAgICAgdGhpcy5mYXRhbCA9IGJpbmQocGFyZW50LCBiaW5kaW5ncywgJ2ZhdGFsJylcbiAgICAgIHRoaXMud2FybiA9IGJpbmQocGFyZW50LCBiaW5kaW5ncywgJ3dhcm4nKVxuICAgICAgdGhpcy5pbmZvID0gYmluZChwYXJlbnQsIGJpbmRpbmdzLCAnaW5mbycpXG4gICAgICB0aGlzLmRlYnVnID0gYmluZChwYXJlbnQsIGJpbmRpbmdzLCAnZGVidWcnKVxuICAgICAgdGhpcy50cmFjZSA9IGJpbmQocGFyZW50LCBiaW5kaW5ncywgJ3RyYWNlJylcbiAgICAgIGlmIChjaGlsZFNlcmlhbGl6ZXJzKSB7XG4gICAgICAgIHRoaXMuc2VyaWFsaXplcnMgPSBjaGlsZFNlcmlhbGl6ZXJzXG4gICAgICAgIHRoaXMuX3NlcmlhbGl6ZSA9IGNoaWxkU2VyaWFsaXplXG4gICAgICB9XG4gICAgICBpZiAodHJhbnNtaXQpIHtcbiAgICAgICAgdGhpcy5fbG9nRXZlbnQgPSBjcmVhdGVMb2dFdmVudFNoYXBlKFxuICAgICAgICAgIFtdLmNvbmNhdChwYXJlbnQuX2xvZ0V2ZW50LmJpbmRpbmdzLCBiaW5kaW5ncylcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgICBDaGlsZC5wcm90b3R5cGUgPSB0aGlzXG4gICAgcmV0dXJuIG5ldyBDaGlsZCh0aGlzKVxuICB9XG4gIHJldHVybiBsb2dnZXJcbn1cblxucGluby5sZXZlbHMgPSB7XG4gIHZhbHVlczoge1xuICAgIGZhdGFsOiA2MCxcbiAgICBlcnJvcjogNTAsXG4gICAgd2FybjogNDAsXG4gICAgaW5mbzogMzAsXG4gICAgZGVidWc6IDIwLFxuICAgIHRyYWNlOiAxMFxuICB9LFxuICBsYWJlbHM6IHtcbiAgICAxMDogJ3RyYWNlJyxcbiAgICAyMDogJ2RlYnVnJyxcbiAgICAzMDogJ2luZm8nLFxuICAgIDQwOiAnd2FybicsXG4gICAgNTA6ICdlcnJvcicsXG4gICAgNjA6ICdmYXRhbCdcbiAgfVxufVxuXG5waW5vLnN0ZFNlcmlhbGl6ZXJzID0gc3RkU2VyaWFsaXplcnNcbnBpbm8uc3RkVGltZUZ1bmN0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbnVsbFRpbWUsIGVwb2NoVGltZSwgdW5peFRpbWUsIGlzb1RpbWUgfSlcblxuZnVuY3Rpb24gc2V0IChvcHRzLCBsb2dnZXIsIGxldmVsLCBmYWxsYmFjaykge1xuICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihsb2dnZXIpXG4gIGxvZ2dlcltsZXZlbF0gPSBsb2dnZXIubGV2ZWxWYWwgPiBsb2dnZXIubGV2ZWxzLnZhbHVlc1tsZXZlbF1cbiAgICA/IG5vb3BcbiAgICA6IChwcm90b1tsZXZlbF0gPyBwcm90b1tsZXZlbF0gOiAoX2NvbnNvbGVbbGV2ZWxdIHx8IF9jb25zb2xlW2ZhbGxiYWNrXSB8fCBub29wKSlcblxuICB3cmFwKG9wdHMsIGxvZ2dlciwgbGV2ZWwpXG59XG5cbmZ1bmN0aW9uIHdyYXAgKG9wdHMsIGxvZ2dlciwgbGV2ZWwpIHtcbiAgaWYgKCFvcHRzLnRyYW5zbWl0ICYmIGxvZ2dlcltsZXZlbF0gPT09IG5vb3ApIHJldHVyblxuXG4gIGxvZ2dlcltsZXZlbF0gPSAoZnVuY3Rpb24gKHdyaXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIExPRyAoKSB7XG4gICAgICBjb25zdCB0cyA9IG9wdHMudGltZXN0YW1wKClcbiAgICAgIGNvbnN0IGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aClcbiAgICAgIGNvbnN0IHByb3RvID0gKE9iamVjdC5nZXRQcm90b3R5cGVPZiAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykgPT09IF9jb25zb2xlKSA/IF9jb25zb2xlIDogdGhpc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSBhcmdzW2ldID0gYXJndW1lbnRzW2ldXG5cbiAgICAgIGlmIChvcHRzLnNlcmlhbGl6ZSAmJiAhb3B0cy5hc09iamVjdCkge1xuICAgICAgICBhcHBseVNlcmlhbGl6ZXJzKGFyZ3MsIHRoaXMuX3NlcmlhbGl6ZSwgdGhpcy5zZXJpYWxpemVycywgdGhpcy5fc3RkRXJyU2VyaWFsaXplKVxuICAgICAgfVxuICAgICAgaWYgKG9wdHMuYXNPYmplY3QpIHdyaXRlLmNhbGwocHJvdG8sIGFzT2JqZWN0KHRoaXMsIGxldmVsLCBhcmdzLCB0cykpXG4gICAgICBlbHNlIHdyaXRlLmFwcGx5KHByb3RvLCBhcmdzKVxuXG4gICAgICBpZiAob3B0cy50cmFuc21pdCkge1xuICAgICAgICBjb25zdCB0cmFuc21pdExldmVsID0gb3B0cy50cmFuc21pdC5sZXZlbCB8fCBsb2dnZXIubGV2ZWxcbiAgICAgICAgY29uc3QgdHJhbnNtaXRWYWx1ZSA9IHBpbm8ubGV2ZWxzLnZhbHVlc1t0cmFuc21pdExldmVsXVxuICAgICAgICBjb25zdCBtZXRob2RWYWx1ZSA9IHBpbm8ubGV2ZWxzLnZhbHVlc1tsZXZlbF1cbiAgICAgICAgaWYgKG1ldGhvZFZhbHVlIDwgdHJhbnNtaXRWYWx1ZSkgcmV0dXJuXG4gICAgICAgIHRyYW5zbWl0KHRoaXMsIHtcbiAgICAgICAgICB0cyxcbiAgICAgICAgICBtZXRob2RMZXZlbDogbGV2ZWwsXG4gICAgICAgICAgbWV0aG9kVmFsdWUsXG4gICAgICAgICAgdHJhbnNtaXRMZXZlbCxcbiAgICAgICAgICB0cmFuc21pdFZhbHVlOiBwaW5vLmxldmVscy52YWx1ZXNbb3B0cy50cmFuc21pdC5sZXZlbCB8fCBsb2dnZXIubGV2ZWxdLFxuICAgICAgICAgIHNlbmQ6IG9wdHMudHJhbnNtaXQuc2VuZCxcbiAgICAgICAgICB2YWw6IGxvZ2dlci5sZXZlbFZhbFxuICAgICAgICB9LCBhcmdzKVxuICAgICAgfVxuICAgIH1cbiAgfSkobG9nZ2VyW2xldmVsXSlcbn1cblxuZnVuY3Rpb24gYXNPYmplY3QgKGxvZ2dlciwgbGV2ZWwsIGFyZ3MsIHRzKSB7XG4gIGlmIChsb2dnZXIuX3NlcmlhbGl6ZSkgYXBwbHlTZXJpYWxpemVycyhhcmdzLCBsb2dnZXIuX3NlcmlhbGl6ZSwgbG9nZ2VyLnNlcmlhbGl6ZXJzLCBsb2dnZXIuX3N0ZEVyclNlcmlhbGl6ZSlcbiAgY29uc3QgYXJnc0Nsb25lZCA9IGFyZ3Muc2xpY2UoKVxuICBsZXQgbXNnID0gYXJnc0Nsb25lZFswXVxuICBjb25zdCBvID0ge31cbiAgaWYgKHRzKSB7XG4gICAgby50aW1lID0gdHNcbiAgfVxuICBvLmxldmVsID0gcGluby5sZXZlbHMudmFsdWVzW2xldmVsXVxuICBsZXQgbHZsID0gKGxvZ2dlci5fY2hpbGRMZXZlbCB8IDApICsgMVxuICBpZiAobHZsIDwgMSkgbHZsID0gMVxuICAvLyBkZWxpYmVyYXRlLCBjYXRjaGluZyBvYmplY3RzLCBhcnJheXNcbiAgaWYgKG1zZyAhPT0gbnVsbCAmJiB0eXBlb2YgbXNnID09PSAnb2JqZWN0Jykge1xuICAgIHdoaWxlIChsdmwtLSAmJiB0eXBlb2YgYXJnc0Nsb25lZFswXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24obywgYXJnc0Nsb25lZC5zaGlmdCgpKVxuICAgIH1cbiAgICBtc2cgPSBhcmdzQ2xvbmVkLmxlbmd0aCA/IGZvcm1hdChhcmdzQ2xvbmVkLnNoaWZ0KCksIGFyZ3NDbG9uZWQpIDogdW5kZWZpbmVkXG4gIH0gZWxzZSBpZiAodHlwZW9mIG1zZyA9PT0gJ3N0cmluZycpIG1zZyA9IGZvcm1hdChhcmdzQ2xvbmVkLnNoaWZ0KCksIGFyZ3NDbG9uZWQpXG4gIGlmIChtc2cgIT09IHVuZGVmaW5lZCkgby5tc2cgPSBtc2dcbiAgcmV0dXJuIG9cbn1cblxuZnVuY3Rpb24gYXBwbHlTZXJpYWxpemVycyAoYXJncywgc2VyaWFsaXplLCBzZXJpYWxpemVycywgc3RkRXJyU2VyaWFsaXplKSB7XG4gIGZvciAoY29uc3QgaSBpbiBhcmdzKSB7XG4gICAgaWYgKHN0ZEVyclNlcmlhbGl6ZSAmJiBhcmdzW2ldIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIGFyZ3NbaV0gPSBwaW5vLnN0ZFNlcmlhbGl6ZXJzLmVycihhcmdzW2ldKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZ3NbaV0gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGFyZ3NbaV0pKSB7XG4gICAgICBmb3IgKGNvbnN0IGsgaW4gYXJnc1tpXSkge1xuICAgICAgICBpZiAoc2VyaWFsaXplICYmIHNlcmlhbGl6ZS5pbmRleE9mKGspID4gLTEgJiYgayBpbiBzZXJpYWxpemVycykge1xuICAgICAgICAgIGFyZ3NbaV1ba10gPSBzZXJpYWxpemVyc1trXShhcmdzW2ldW2tdKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGJpbmQgKHBhcmVudCwgYmluZGluZ3MsIGxldmVsKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgYXJncyA9IG5ldyBBcnJheSgxICsgYXJndW1lbnRzLmxlbmd0aClcbiAgICBhcmdzWzBdID0gYmluZGluZ3NcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSAtIDFdXG4gICAgfVxuICAgIHJldHVybiBwYXJlbnRbbGV2ZWxdLmFwcGx5KHRoaXMsIGFyZ3MpXG4gIH1cbn1cblxuZnVuY3Rpb24gdHJhbnNtaXQgKGxvZ2dlciwgb3B0cywgYXJncykge1xuICBjb25zdCBzZW5kID0gb3B0cy5zZW5kXG4gIGNvbnN0IHRzID0gb3B0cy50c1xuICBjb25zdCBtZXRob2RMZXZlbCA9IG9wdHMubWV0aG9kTGV2ZWxcbiAgY29uc3QgbWV0aG9kVmFsdWUgPSBvcHRzLm1ldGhvZFZhbHVlXG4gIGNvbnN0IHZhbCA9IG9wdHMudmFsXG4gIGNvbnN0IGJpbmRpbmdzID0gbG9nZ2VyLl9sb2dFdmVudC5iaW5kaW5nc1xuXG4gIGFwcGx5U2VyaWFsaXplcnMoXG4gICAgYXJncyxcbiAgICBsb2dnZXIuX3NlcmlhbGl6ZSB8fCBPYmplY3Qua2V5cyhsb2dnZXIuc2VyaWFsaXplcnMpLFxuICAgIGxvZ2dlci5zZXJpYWxpemVycyxcbiAgICBsb2dnZXIuX3N0ZEVyclNlcmlhbGl6ZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGxvZ2dlci5fc3RkRXJyU2VyaWFsaXplXG4gIClcbiAgbG9nZ2VyLl9sb2dFdmVudC50cyA9IHRzXG4gIGxvZ2dlci5fbG9nRXZlbnQubWVzc2FnZXMgPSBhcmdzLmZpbHRlcihmdW5jdGlvbiAoYXJnKSB7XG4gICAgLy8gYmluZGluZ3MgY2FuIG9ubHkgYmUgb2JqZWN0cywgc28gcmVmZXJlbmNlIGVxdWFsaXR5IGNoZWNrIHZpYSBpbmRleE9mIGlzIGZpbmVcbiAgICByZXR1cm4gYmluZGluZ3MuaW5kZXhPZihhcmcpID09PSAtMVxuICB9KVxuXG4gIGxvZ2dlci5fbG9nRXZlbnQubGV2ZWwubGFiZWwgPSBtZXRob2RMZXZlbFxuICBsb2dnZXIuX2xvZ0V2ZW50LmxldmVsLnZhbHVlID0gbWV0aG9kVmFsdWVcblxuICBzZW5kKG1ldGhvZExldmVsLCBsb2dnZXIuX2xvZ0V2ZW50LCB2YWwpXG5cbiAgbG9nZ2VyLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoYmluZGluZ3MpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxvZ0V2ZW50U2hhcGUgKGJpbmRpbmdzKSB7XG4gIHJldHVybiB7XG4gICAgdHM6IDAsXG4gICAgbWVzc2FnZXM6IFtdLFxuICAgIGJpbmRpbmdzOiBiaW5kaW5ncyB8fCBbXSxcbiAgICBsZXZlbDogeyBsYWJlbDogJycsIHZhbHVlOiAwIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhc0VyclZhbHVlIChlcnIpIHtcbiAgY29uc3Qgb2JqID0ge1xuICAgIHR5cGU6IGVyci5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgIG1zZzogZXJyLm1lc3NhZ2UsXG4gICAgc3RhY2s6IGVyci5zdGFja1xuICB9XG4gIGZvciAoY29uc3Qga2V5IGluIGVycikge1xuICAgIGlmIChvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvYmpba2V5XSA9IGVycltrZXldXG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpcbn1cblxuZnVuY3Rpb24gZ2V0VGltZUZ1bmN0aW9uIChvcHRzKSB7XG4gIGlmICh0eXBlb2Ygb3B0cy50aW1lc3RhbXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gb3B0cy50aW1lc3RhbXBcbiAgfVxuICBpZiAob3B0cy50aW1lc3RhbXAgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIG51bGxUaW1lXG4gIH1cbiAgcmV0dXJuIGVwb2NoVGltZVxufVxuXG5mdW5jdGlvbiBtb2NrICgpIHsgcmV0dXJuIHt9IH1cbmZ1bmN0aW9uIHBhc3N0aHJvdWdoIChhKSB7IHJldHVybiBhIH1cbmZ1bmN0aW9uIG5vb3AgKCkge31cblxuZnVuY3Rpb24gbnVsbFRpbWUgKCkgeyByZXR1cm4gZmFsc2UgfVxuZnVuY3Rpb24gZXBvY2hUaW1lICgpIHsgcmV0dXJuIERhdGUubm93KCkgfVxuZnVuY3Rpb24gdW5peFRpbWUgKCkgeyByZXR1cm4gTWF0aC5yb3VuZChEYXRlLm5vdygpIC8gMTAwMC4wKSB9XG5mdW5jdGlvbiBpc29UaW1lICgpIHsgcmV0dXJuIG5ldyBEYXRlKERhdGUubm93KCkpLnRvSVNPU3RyaW5nKCkgfSAvLyB1c2luZyBEYXRlLm5vdygpIGZvciB0ZXN0YWJpbGl0eVxuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIHBmR2xvYmFsVGhpc09yRmFsbGJhY2sgKCkge1xuICBmdW5jdGlvbiBkZWZkIChvKSB7IHJldHVybiB0eXBlb2YgbyAhPT0gJ3VuZGVmaW5lZCcgJiYgbyB9XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGdsb2JhbFRoaXNcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ2dsb2JhbFRoaXMnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGVsZXRlIE9iamVjdC5wcm90b3R5cGUuZ2xvYmFsVGhpc1xuICAgICAgICByZXR1cm4gKHRoaXMuZ2xvYmFsVGhpcyA9IHRoaXMpXG4gICAgICB9LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgICByZXR1cm4gZ2xvYmFsVGhpc1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGRlZmQoc2VsZikgfHwgZGVmZCh3aW5kb3cpIHx8IGRlZmQodGhpcykgfHwge31cbiAgfVxufVxuLyogZXNsaW50LWVuYWJsZSAqL1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBUYWdCb3ggfSBmcm9tICcuL2NvbXBvbmVudHMvVGFnQm94L1RhZ0JveCc7XG5pbXBvcnQgeyBUYWdTZXJ2aWNlIH0gZnJvbSAnLi9UYWdTZXJ2aWNlJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJ1xuXG5jb25zdCB1c2VyRW1haWwgPSBcImFqYXl1bWFzYW5rYXJAZ21haWwuY29tXCJcbmNvbnN0IGRlbGF5ID0gKHQ6bnVtYmVyKSA9PiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdCkpO1xuXG53aW5kb3cub25sb2FkID0gYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IFRhZ1NlcnZpY2UuZ2V0RW5kcG9pbnQoKTtcbiAgICBjb25zdCBjdXJyZW50VXJsOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICBjb25zdCBwbGF5bGlzdFJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKCd5b3V0dWJlXFwuY29tXFwvcGxheWxpc3RcXFxcP2xpc3Q9JywgJ2knKVxuICAgIGlmIChwbGF5bGlzdFJlZ2V4LnRlc3QoY3VycmVudFVybCkpIGRlbGF5KDMwMDApLnRoZW4oKCkgPT4gaW5qZWN0VGFnQm94VG9QbGF5bGlzdEl0ZW1zKCkpO1xuICAgIGNvbnN0IHBsYXlsaXN0U29uZ1JlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKCd5b3V0dWJlLmNvbS93YXRjaFxcXFw/dj0oLiopXFwmbGlzdD0nLCAnaScpXG4gICAgaWYgKHBsYXlsaXN0U29uZ1JlZ2V4LnRlc3QoY3VycmVudFVybCkpIHtcbiAgICAgICAgd2FpdEZvcllvdXR1YmUoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluamVjdFRhZ0JveFRvU29uZygpIHtcbiAgICAvLyBwcmltYXJ5RWwucXVlcnlTZWxlY3RvcihcImRpdi53YXRjaC1hY3RpdmUtbWV0YWRhdGEgZGl2Om50aC1jaGlsZCgyKVwiKVxuICAgIGNvbnN0IHBsYXlsaXN0TmFtZUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaDMgeXQtZm9ybWF0dGVkLXN0cmluZyBhW2hyZWZePVwiL3BsYXlsaXN0XCJdJykgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgY29uc3QgY2hhbm5lbE5hbWVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3l0LWZvcm1hdHRlZC1zdHJpbmdbY2xhc3MqPVwieXRkLWNoYW5uZWwtbmFtZVwiXSBhJykgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgY29uc3Qgc29uZ05hbWVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXZbaWQ9XFxcImNvbnRhaW5lclxcXCJdIGgxIHl0LWZvcm1hdHRlZC1zdHJpbmdcIikgYXMgSFRNTEVsZW1lbnRcblxuICAgIGNvbnN0IHRhZ3MgPSBhd2FpdCBUYWdTZXJ2aWNlLmdldFRhZ3ModXNlckVtYWlsLCBnZXRTb25nSWQod2luZG93LmxvY2F0aW9uLmhyZWYpLCBzb25nTmFtZUVsLmlubmVyVGV4dCwgZ2V0UGxheWxpc3RJZCh3aW5kb3cubG9jYXRpb24uaHJlZiksIHBsYXlsaXN0TmFtZUVsLmlubmVyVGV4dCwgY2hhbm5lbE5hbWVFbC5pbm5lclRleHQpXG4gICAgbG9nZ2VyLmluZm8oXCJBZGRpbmcgdGFnYm94IHRvIGN1cnJlbnRseSBwbGF5aW5nIHNvbmdcIiwge1xuICAgICAgICBcIlVzZXIgRW1haWxcIjogdXNlckVtYWlsLFxuICAgICAgICBcIlNvbmcgSURcIjogZ2V0U29uZ0lkKHdpbmRvdy5sb2NhdGlvbi5ocmVmKSxcbiAgICAgICAgXCJTb25nIE5hbWVcIjogc29uZ05hbWVFbC5pbm5lclRleHQsXG4gICAgICAgIFwiUGxheWxpc3QgSURcIjogZ2V0UGxheWxpc3RJZCh3aW5kb3cubG9jYXRpb24uaHJlZiksXG4gICAgICAgIFwiUGxheWxpc3QgTmFtZTpcIjogcGxheWxpc3ROYW1lRWwuaW5uZXJUZXh0LFxuICAgICAgICBcIkNoYW5uZWwgTmFtZVwiOiBjaGFubmVsTmFtZUVsLmlubmVyVGV4dCxcbiAgICAgICAgXCJUYWdzXCI6IHRhZ3NcbiAgICB9KVxuICAgIGNvbnN0IHRhZ0JveEVsID0gbmV3IFRhZ0JveCh1c2VyRW1haWwsIGdldFNvbmdJZCh3aW5kb3cubG9jYXRpb24uaHJlZiksIHRhZ3MpXG5cbiAgICBjb25zdCBiZWxvd1RoZVBsYXllckVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdltpZD1cXFwiYWJvdmUtdGhlLWZvbGRcXFwiXVwiKSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICBiZWxvd1RoZVBsYXllckVsLmluc2VydEJlZm9yZSh0YWdCb3hFbC5kaXZFbCwgYmVsb3dUaGVQbGF5ZXJFbC5maXJzdENoaWxkKTtcbn1cblxuZnVuY3Rpb24gaW5qZWN0VGFnQm94VG9QbGF5bGlzdEl0ZW1zKCkge1xuICAgIC8vIFRyYXZlcnNpbmcgdGhlIEFjdHVhbCBTb25nIFBhbmVzXG4gICAgY29uc3QgZGlzcGxheURpYWxvZ0VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2Rpc3BsYXktZGlhbG9nJylbMF0gYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgY29uc3Qgc29uZ1BhbmVzOiBOb2RlTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXYgeXRkLXBsYXlsaXN0LXZpZGVvLXJlbmRlcmVyXCIpOyBcbiAgICBjb25zb2xlLmxvZyhzb25nUGFuZXMpXG4gICAgc29uZ1BhbmVzLmZvckVhY2goYXN5bmMgKHNvbmdQYW5lKSAgPT4ge1xuICAgICAgICBsZXQgc29uZ1BhbmVFbCA9IHNvbmdQYW5lIGFzIEVsZW1lbnQ7XG5cbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZGl2IHRoYXQgcmVwcmVzZW50cyB0aGUgd2hvbGUgcm93XG4gICAgICAgIGNvbnN0IGNvbnRlbnRFbCA9IHNvbmdQYW5lRWwuY2hpbGRyZW5bMV0gYXMgSFRNTERpdkVsZW1lbnQ7XG5cbiAgICAgICAgLy8gVGhpcyBpcyB5b3V0dWJlcyBjb250YWluZXIgZWxlbWVudCBpbmNsdWRpbmcgd2hpY2ggY29udGFpbnMgdGhlIHRodW1ibmFpbCBhbmQgbWV0YWRhdGFcbiAgICAgICAgY29uc3QgY29udGFpbmVyRWwgPSBjb250ZW50RWwuY2hpbGRyZW5bMF0gYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgIGNvbnRhaW5lckVsLnN0eWxlLmFsaWduSXRlbXMgPSAnY2VudGVyJztcbiAgICAgICAgY29udGVudEVsLnN0eWxlLmZsZXhXcmFwID0gJ25vd3JhcCdcblxuICAgICAgICAvLyBXaXRoaW4gdGhlIHRodW1ibmFpbCB3ZSBjYW4gZ2V0IHRoZSBocmVmXG4gICAgICAgIGNvbnN0IHRodW1ibmFpbEVsID0gY29udGFpbmVyRWwuY2hpbGRyZW5bMF0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGFuY2hvckVsID0gdGh1bWJuYWlsRWwuY2hpbGRyZW5bMF0gYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG5cbiAgICAgICAgLy8gV2l0aGluIHRoZSBtZXRhZGF0YSB3ZSBjYW4gZ2V0IHRoZSBzb25nIHRpdGxlLCBhdXRob3JcbiAgICAgICAgY29uc3QgbWV0YUVsID0gY29udGFpbmVyRWwuY2hpbGRyZW5bMV07XG4gICAgICAgIGNvbnN0IG1ldGFEYXRhRWwgPSBtZXRhRWwuY2hpbGRyZW5bMV0uY2hpbGRyZW5bMF0gYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGNoYW5uZWxOYW1lQ29udGFpbmVyRWwgPSBtZXRhRGF0YUVsLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzBdIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBjaGFubmVsTmFtZUVsID0gY2hhbm5lbE5hbWVDb250YWluZXJFbC5jaGlsZHJlblswXS5jaGlsZHJlblswXS5jaGlsZHJlblswXSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcblxuICAgICAgICBjb25zdCBzb25nTmFtZUVsID0gbWV0YUVsLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzFdIGFzIEhUTUxBbmNob3JFbGVtZW50XG4gICAgICAgIGNvbnN0IHBsYXlsaXN0TmFtZUVsID0gZGlzcGxheURpYWxvZ0VsLmNoaWxkcmVuWzFdIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHRhZ3MgPSBhd2FpdCBUYWdTZXJ2aWNlLmdldFRhZ3ModXNlckVtYWlsLCBnZXRTb25nSWQoYW5jaG9yRWwuaHJlZiksIHNvbmdOYW1lRWwuaW5uZXJUZXh0LCBnZXRQbGF5bGlzdElkKHdpbmRvdy5sb2NhdGlvbi5ocmVmKSwgcGxheWxpc3ROYW1lRWwuaW5uZXJUZXh0LCBjaGFubmVsTmFtZUVsLmlubmVyVGV4dClcbiAgICAgICAgbG9nZ2VyLmluZm8oXCJBZGRpbmcgdGFnYm94IHRvIHBsYXlsaXN0IGl0ZW1cIiwge1xuICAgICAgICAgICAgXCJVc2VyIEVtYWlsXCI6IHVzZXJFbWFpbCxcbiAgICAgICAgICAgIFwiU29uZyBJRFwiOiBnZXRTb25nSWQoYW5jaG9yRWwuaHJlZiksXG4gICAgICAgICAgICBcIlNvbmcgTmFtZVwiOiBzb25nTmFtZUVsLmlubmVyVGV4dCxcbiAgICAgICAgICAgIFwiUGxheWxpc3QgSURcIjogZ2V0UGxheWxpc3RJZCh3aW5kb3cubG9jYXRpb24uaHJlZiksXG4gICAgICAgICAgICBcIlBsYXlsaXN0IE5hbWU6XCI6IHBsYXlsaXN0TmFtZUVsLmlubmVyVGV4dCxcbiAgICAgICAgICAgIFwiQ2hhbm5lbCBOYW1lXCI6IGNoYW5uZWxOYW1lRWwuaW5uZXJUZXh0LFxuICAgICAgICAgICAgXCJUYWdzXCI6IHRhZ3NcbiAgICAgICAgfSlcbiAgICAgICAgLy8gbG9nZ2VyLmluZm8oY2hhbm5lbE5hbWVFbCwgc29uZ05hbWVFbCwgcGxheWxpc3ROYW1lRWwpXG5cbiAgICAgICAgY29uc3QgdGFnQm94RWwgPSBuZXcgVGFnQm94KHVzZXJFbWFpbCwgZ2V0U29uZ0lkKGFuY2hvckVsLmhyZWYpLCB0YWdzKVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnVGhpcyBzb25ncyBwYXJzZWQgdXJsIGlzOiAnLCBnZXRTb25nSWQoYW5jaG9yRWwuaHJlZikpO1xuICAgICAgICBjb250ZW50RWwuYXBwZW5kQ2hpbGQodGFnQm94RWwuZGl2RWwpO1xuICAgIH0pXG59XG5cbmNvbnN0IHdhaXRGb3JZb3V0dWJlID0gYXN5bmMgKHJvb3RFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSA9PiB7XG4gICAgbGV0IHNlbGVjdG9yOmFueSA9ICdhYm92ZS10aGUtZm9sZCdcbiAgICBjb25zb2xlLmxvZyhgV2FpdGluZyBmb3IgJHtzZWxlY3Rvcn0uLi5gLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xuICAgIGxldCBjb25maWcgPSB7XG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICB9XG4gICAgLy8gRmlyc3QsIGF0dGFjaCB0YWcgYm94IHdoZW4gdGhlIGVsZW1lbnQgaXMgZm91bmRcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtzZWxlY3Rvcn0gd2FzIGZvdW5kIWAsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgaW5qZWN0VGFnQm94VG9Tb25nKCk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZWxlbWVudCBhcyBIVE1MRGl2RWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHJvb3RFbGVtZW50LCBjb25maWcpO1xuICAgIH0pLnRoZW4oZWxlbWVudCA9PiB7XG4gICAgLy8gU2Vjb25kbHksIHRoaXMgaXMgZm9yIHdoZW4gd2UgZ28gdG8gYSBuZXcgc29uZyBhbmQgdGhlIGVsZW1lbnQgY2hhbmdlc1xuICAgICAgICBzZWxlY3RvciA9ICdkaXYjYWJvdmUtdGhlLWZvbGQgZGl2I3RpdGxlIGgxJyAvLyBlbGVtZW50IHRoYXQgaG9sZHMgdGl0bGVcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb25DaGFuZ2VkID0gZnVuY3Rpb24gKG11dGF0aW9uc0xpc3Q6YW55LCBvYnNlcnZlcjphbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDaGFuZ2VzIGRldGVjdGVkIGluICR7c2VsZWN0b3J9YCwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIGRlbGV0ZVRhZ0JveGVzKCk7XG4gICAgICAgICAgICBpbmplY3RUYWdCb3hUb1NvbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGVzY3JpcHRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGRlc2NyaXB0aW9uQ2hhbmdlZClcbiAgICAgICAgZGVzY3JpcHRpb25PYnNlcnZlci5vYnNlcnZlKChlbGVtZW50IGFzIEhUTUxEaXZFbGVtZW50KS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSwgY29uZmlnKVxuICAgIH0pXG59O1xuXG5cblxuXG5mdW5jdGlvbiBkZWxldGVUYWdCb3hlcygpIHtcbiAgICBjb25zdCB0YWdCb3hXcmFwcGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50YWdib3gnKSBhcyBOb2RlTGlzdE9mPEVsZW1lbnQ+O1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiB0YWdCb3hXcmFwcGVycykge1xuICAgICAgICBlbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0U29uZ0lkKGhyZWY6IHN0cmluZykge1xuICAgIGNvbnN0IHJlZ2V4cDogUmVnRXhwID0gL3dhdGNoXFw/dj0oLio/KVxcJi9pO1xuICAgIGNvbnN0IHJlc3VsdDogUmVnRXhwTWF0Y2hBcnJheSA9IGhyZWYubWF0Y2gocmVnZXhwKSBhcyBSZWdFeHBNYXRjaEFycmF5O1xuICAgIHJldHVybiByZXN1bHRbMV07XG59XG5cbmZ1bmN0aW9uIGdldFBsYXlsaXN0SWQoaHJlZjogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVnZXhwOiBSZWdFeHAgPSAvbGlzdD0oW2EtekEtWjAtOV8tXSspL2k7XG4gICAgY29uc3QgcmVzdWx0OiBSZWdFeHBNYXRjaEFycmF5ID0gaHJlZi5tYXRjaChyZWdleHApIGFzIFJlZ0V4cE1hdGNoQXJyYXk7XG4gICAgcmV0dXJuIHJlc3VsdFsxXTtcbn1cblxuXG5cblxuXG5cbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsImltcG9ydCB7IFRhZ1NlcnZpY2UgfSBmcm9tIFwiLi4vLi4vY29udGVudHNjcmlwdC9UYWdTZXJ2aWNlXCI7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCIuLi8uLi9jb250ZW50c2NyaXB0L2xvZ2dlclwiO1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICBUYWdTZXJ2aWNlLmdldEVuZHBvaW50KCkudGhlbigoZW5kcG9pbnQpID0+IHtcclxuICAgICAgICBsZXQgdXJsID0gYCR7ZW5kcG9pbnR9L3RhZ3MvYWpheXVtYXNhbmthckBnbWFpbC5jb20vYFxyXG4gICAgICAgICQoJyN0YWdzJykuc2VsZWN0Mih7XHJcbiAgICAgICAgICAgIGFqYXg6IHtcclxuICAgICAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICAgICAgICAgIGRlbGF5OiAyNTAsIC8vIHdhaXQgMjUwIG1pbGxpc2Vjb25kcyBiZWZvcmUgdHJpZ2dlcmluZyB0aGUgcmVxdWVzdFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKHBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeVBhcmFtZXRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlcm06IHBhcmFtcy50ZXJtID8gcGFyYW1zLnRlcm0gOiBcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBxdWVyeVBhcmFtZXRlcnM7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc1Jlc3VsdHM6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oZGF0YSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBkYXRhLnJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSkgICAgXHJcbn0pO1xyXG5cclxuXHJcbiJdLCJuYW1lcyI6WyJsb2dnZXIiLCJUYWdTZXJ2aWNlIiwiZW5kcG9pbnQiLCJnZXRFbmRwb2ludCIsImhlYWx0aFVybCIsInJlcyIsImdldCIsInR5cGUiLCJ3YXJuIiwiZ2V0VGFncyIsInVzZXJFbWFpbCIsInNvbmdJZCIsInNvbmdOYW1lIiwicGxheWxpc3RJZCIsInBsYXlsaXN0TmFtZSIsInVwbG9hZGVyIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwidXJsIiwidGhlbiIsImpzb24iLCJ0YWdzT2JqIiwidGFnc01hcCIsIk1hcCIsIk9iamVjdCIsImVudHJpZXMiLCJpbmZvIiwic2V0VGFnIiwidGFnTmFtZSIsInBvc3QiLCJkZWxldGVUYWciLCJkZWxldGUiLCJwYXRoIiwicGFyYW1zIiwibWV0aG9kIiwicmVkaXJlY3QiLCJtb2RlIiwiZmV0Y2hXaXRoRXJyb3JIYW5kbGluZyIsImJvZHkiLCJoZWFkZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsInJlc3BvbnNlIiwiZmV0Y2giLCJvayIsImVycm9yIiwiUmVzcG9uc2UiLCJzdHlsZXMiLCJUYWciLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJkYXRlIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwicHJpb3JpdHkiLCJUYWdCb3giLCJkaXZFbCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInRhZ3MiLCJjbGFzc0xpc3QiLCJhZGQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZ0Iiwic3RvcFByb3BhZ2F0aW9uIiwiaW5uZXJIVE1MIiwiaW5wdXRFbCIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRUYWciLCJiaW5kIiwiZm9yRWFjaCIsInRhZyIsImFkZFRhZ0Zyb250ZW5kIiwiZSIsImtleSIsInRhcmdldCIsInZhbHVlIiwicmVwbGFjZSIsImhhcyIsImFuY2hvclRhZyIsImhyZWYiLCJkZWxldGVUYWdCb3VuZCIsImluc2VydEFkamFjZW50RWxlbWVudCIsImVsZW1lbnQiLCJjb25zb2xlIiwibG9nIiwicmVtb3ZlIiwiZGVsYXkiLCJ0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZXRUaW1lb3V0Iiwid2luZG93Iiwib25sb2FkIiwiY3VycmVudFVybCIsImxvY2F0aW9uIiwicGxheWxpc3RSZWdleCIsIlJlZ0V4cCIsInRlc3QiLCJpbmplY3RUYWdCb3hUb1BsYXlsaXN0SXRlbXMiLCJwbGF5bGlzdFNvbmdSZWdleCIsIndhaXRGb3JZb3V0dWJlIiwiaW5qZWN0VGFnQm94VG9Tb25nIiwicGxheWxpc3ROYW1lRWwiLCJjaGFubmVsTmFtZUVsIiwic29uZ05hbWVFbCIsImdldFNvbmdJZCIsImlubmVyVGV4dCIsImdldFBsYXlsaXN0SWQiLCJ0YWdCb3hFbCIsImJlbG93VGhlUGxheWVyRWwiLCJpbnNlcnRCZWZvcmUiLCJmaXJzdENoaWxkIiwiZGlzcGxheURpYWxvZ0VsIiwicXVlcnlTZWxlY3RvckFsbCIsInNvbmdQYW5lcyIsInNvbmdQYW5lIiwic29uZ1BhbmVFbCIsImNvbnRlbnRFbCIsImNoaWxkcmVuIiwiY29udGFpbmVyRWwiLCJzdHlsZSIsImFsaWduSXRlbXMiLCJmbGV4V3JhcCIsInRodW1ibmFpbEVsIiwiYW5jaG9yRWwiLCJtZXRhRWwiLCJtZXRhRGF0YUVsIiwiY2hhbm5lbE5hbWVDb250YWluZXJFbCIsImFwcGVuZENoaWxkIiwicm9vdEVsZW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJzZWxlY3RvciIsImNvbmZpZyIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJvYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJnZXRFbGVtZW50QnlJZCIsImRpc2Nvbm5lY3QiLCJvYnNlcnZlIiwiZGVzY3JpcHRpb25DaGFuZ2VkIiwibXV0YXRpb25zTGlzdCIsImRlbGV0ZVRhZ0JveGVzIiwiZGVzY3JpcHRpb25PYnNlcnZlciIsInRhZ0JveFdyYXBwZXJzIiwicmVnZXhwIiwicmVzdWx0IiwibWF0Y2giXSwic291cmNlUm9vdCI6IiJ9