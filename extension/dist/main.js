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
      // logger.info("Recieved tagsObj which was converted into tagsMap", tagsObj, tagsMap)
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
    const tagBoxEl = new _components_TagBox_TagBox__WEBPACK_IMPORTED_MODULE_0__.TagBox(userEmail, getSongId(anchorEl.href), tags);
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
    const observer = new MutationObserver(async () => {
      const element = document.getElementById(selector);
      if (element) {
        console.log(`${selector} was found!`, new Date().toISOString());
        observer.disconnect(); // this must come first or else we infinite loop since we modify above-the-fold
        await injectTagBoxToSong();
        resolve(element);
      }
    });
    observer.observe(rootElement, config);
  }).then(element => {
    // Secondly, this is for when we go to a new song and the element changes
    selector = 'div#above-the-fold div#title h1'; // element that holds title
    const descriptionChanged = async function (mutationsList, observer) {
      console.log(`Changes detected in ${selector}`, new Date().toISOString());
      await deleteTagBoxes();
      await injectTagBoxToSong();
    };
    let descriptionObserver = new MutationObserver(descriptionChanged);
    descriptionObserver.observe(element.querySelector(selector), config);
  });
};
async function deleteTagBoxes() {
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


// its actually crazy how just including this file in webpack can let you resolve the imports above instantly. without it, we crash
// and somehow we still retain the pathing of our imports correctly..

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLFNBQVM7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7QUM1R1k7O0FBRVosZUFBZSxtQkFBTyxDQUFDLCtFQUF3Qjs7QUFFL0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EseURBQXlEOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esd0NBQXdDLElBQUksd0NBQXdDOztBQUVwRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGlCQUFpQjs7QUFFdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxv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LE1BQU0vQixPQUFPLElBQUk4RCxjQUFjLEVBQUU7SUFDbEM5RCxPQUFPLENBQUNHLE1BQU0sRUFBRTtFQUNwQjtBQUNKO0FBRUEsU0FBU29CLFNBQVNBLENBQUMxQixJQUFZLEVBQUU7RUFDN0IsTUFBTWtFLE1BQWMsR0FBRyxtQkFBbUI7RUFDMUMsTUFBTUMsTUFBd0IsR0FBR25FLElBQUksQ0FBQ29FLEtBQUssQ0FBQ0YsTUFBTSxDQUFxQjtFQUN2RSxPQUFPQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3BCO0FBRUEsU0FBU3ZDLGFBQWFBLENBQUM1QixJQUFZLEVBQUU7RUFDakMsTUFBTWtFLE1BQWMsR0FBRyx3QkFBd0I7RUFDL0MsTUFBTUMsTUFBd0IsR0FBR25FLElBQUksQ0FBQ29FLEtBQUssQ0FBQ0YsTUFBTSxDQUFxQjtFQUN2RSxPQUFPQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLEM7Ozs7Ozs7Ozs7QUN6SUE7Ozs7Ozs7Ozs7OztBQ0E0RDtBQUNSO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSw2RUFBc0I7QUFDMUIscUJBQXFCLFNBQVM7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMLENBQUM7QUFDRDtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vbG9nZ2VyLmpzIiwid2VicGFjazovLy8uL1RhZ1NlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vLy4vY29tcG9uZW50cy9UYWdCb3gvVGFnQm94LnRzIiwid2VicGFjazovLy8uL2NvbXBvbmVudHMvVGFnQm94L1RhZ0JveEFkZEJ1dHRvbi5tb2R1bGUuc2NzcyIsIndlYnBhY2s6Ly8vLi4vbm9kZV9tb2R1bGVzL3F1aWNrLWZvcm1hdC11bmVzY2FwZWQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy9waW5vL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vLy4vVGFnQm94SW5qZWN0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vY29tcG9uZW50cy9UYWdCb3gvVGFnQm94LmNzcyIsIndlYnBhY2s6Ly8vLi4vb3B0aW9ucy9qcy9wbGF5bGlzdGNyZWF0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgcGlubyA9IHJlcXVpcmUoXCJwaW5vXCIpO1xyXG5cclxuY29uc3QgbGV2ZWwgPSBcImRlYnVnXCI7XHJcbmNvbnN0IHByZXR0eVByaW50ID0ge1xyXG5cdGNvbG9yaXplOiBcInRydWVcIiwgLy8gLS1jb2xvcml6ZTogYWRkIHRlcm1pbmFsIGNvbG9yIGVzY2FwZSBzZXF1ZW5jZSB0byB0aGUgb3V0cHV0XHJcblx0bGV2ZWxGaXJzdDogdHJ1ZSwgLy8gLS1sZXZlbEZpcnN0OiBkaXNwbGF5IHRoZSBsb2cgbGV2ZWwgbmFtZSBiZWZvcmUgdGhlIGxvZ2dlZCBkYXRlIGFuZCB0aW1lXHJcblx0dHJhbnNsYXRlVGltZTogXCJTWVM6c3RhbmRhcmRcIiwgLy8gLS10cmFuc2xhdGVUaW1lOiB0cmFuc2xhdGUgdGhlIGVwb2NoIHRpbWUgdG8gbG9jYWwgc3lzdGVtJ3MgVFosIGluIGh1bWFuIHJlYWRhYmxlIGZvcm1hdFxyXG5cdGlnbm9yZTogXCJwaWQsaG9zdG5hbWUsbW9kdWxlXCIgLy8gLS1pZ25vcmU6IGlnbm9yZSBvbmUgb3Igc2V2ZXJhbCBrZXlzXHJcblx0Ly8gc2luZ2xlTGluZTogdHJ1ZSwgLy8gLS1zaW5nbGVMaW5lOiBwcmludCBlYWNoIGxvZyBtZXNzYWdlIG9uIGEgc2luZ2xlIGxpbmVcclxuXHQvLyBtZXNzYWdlRm9ybWF0OiBcIih7bW9kdWxlfSkge21zZ31cIiAvLyAtLW1lc3NhZ2VGb3JtYXQ6IGZvcm1hdCBvdXRwb3V0IGZvciB0aGUgbWVzc2FnZSBwb3J0aW9uIG9mIHRoZSBsb2dcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBsb2dnZXIgPSBwaW5vKHtcclxuXHRuYW1lOiBcInNlcnZlclwiLFxyXG5cdGxldmVsOiBcImRlYnVnXCIsXHJcblx0Zm9ybWF0dGVyczoge1xyXG5cdFx0bGV2ZWwobGFiZWwpIHtcclxuXHRcdFx0cmV0dXJuIHsgbGV2ZWw6IGxhYmVsIH07XHJcblx0XHR9XHJcblx0fSxcclxuXHRwcmV0dHlQcmludDogcHJldHR5UHJpbnRcclxufSkiLCJpbXBvcnQgeyBUYWcgfSBmcm9tICcuL2NvbXBvbmVudHMvVGFnQm94L1RhZ0JveCdcclxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInXHJcblxyXG5leHBvcnQgY2xhc3MgVGFnU2VydmljZSB7XHJcbiAgICBzdGF0aWMgZW5kcG9pbnQ6IHN0cmluZyA9IFwiaHR0cDovL2xvY2FsaG9zdDo4MDAwXCJcclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0RW5kcG9pbnQoKSB7XHJcbiAgICAgICAgY29uc3QgaGVhbHRoVXJsID0gYCR7VGFnU2VydmljZS5lbmRwb2ludH0vYFxyXG4gICAgICAgIGNvbnN0IHJlczogUmVzcG9uc2UgPSBhd2FpdCBUYWdTZXJ2aWNlLmdldChoZWFsdGhVcmwpXHJcbiAgICAgICAgaWYocmVzLnR5cGUgPT0gXCJlcnJvclwiKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBMb2NhbCBBUEkgbm90IGZvdW5kLCB1c2luZyBSYWlsd2F5IGF0OiBodHRwczovL3Nvbmd0YWdzLXByb2R1Y3Rpb24udXAucmFpbHdheS5hcHBgKVxyXG4gICAgICAgICAgICBUYWdTZXJ2aWNlLmVuZHBvaW50ID0gXCJodHRwczovL3Nvbmd0YWdzLXByb2R1Y3Rpb24udXAucmFpbHdheS5hcHBcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5kcG9pbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGdldFRhZ3ModXNlckVtYWlsOiBzdHJpbmcsIHNvbmdJZDpzdHJpbmcsIHNvbmdOYW1lOnN0cmluZywgcGxheWxpc3RJZDpzdHJpbmcsIHBsYXlsaXN0TmFtZTpzdHJpbmcsIHVwbG9hZGVyOnN0cmluZyA9IFwiXCIpOiBQcm9taXNlPE1hcDxzdHJpbmcsIFRhZz4+IHtcclxuICAgICAgICBzb25nTmFtZSA9IGVuY29kZVVSSUNvbXBvbmVudChzb25nTmFtZSlcclxuICAgICAgICB2YXIgdXJsID0gYCR7VGFnU2VydmljZS5lbmRwb2ludH0vdGFncy8ke3VzZXJFbWFpbH0vJHtzb25nSWR9P3VwbG9hZGVyPSR7dXBsb2FkZXJ9JnNvbmdfbmFtZT0ke3NvbmdOYW1lfSZwbGF5bGlzdF9uYW1lPSR7cGxheWxpc3ROYW1lfSZwbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YFxyXG4gICAgICAgIC8vIHVybCA9IGVuY29kZVVSSSh1cmwpIC8vIG9yIGVsc2UgIyBpbiBzb25nbmFtZSB3aWxsIGJyZWFrXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFRhZ1NlcnZpY2UuZ2V0KHVybCkudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcclxuICAgICAgICAudGhlbigodGFnc09iaikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0YWdzTWFwOiBNYXA8c3RyaW5nLFRhZz4gPSBuZXcgTWFwKE9iamVjdC5lbnRyaWVzKHRhZ3NPYmopKTtcclxuICAgICAgICAgICAgLy8gbG9nZ2VyLmluZm8oXCJSZWNpZXZlZCB0YWdzT2JqIHdoaWNoIHdhcyBjb252ZXJ0ZWQgaW50byB0YWdzTWFwXCIsIHRhZ3NPYmosIHRhZ3NNYXApXHJcbiAgICAgICAgICAgIHJldHVybiB0YWdzTWFwXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICAgIHN0YXRpYyBhc3luYyBzZXRUYWcodXNlckVtYWlsOiBzdHJpbmcsIHNvbmdJZDpzdHJpbmcsIHRhZ05hbWU6IHN0cmluZyk6IFByb21pc2U8VGFnPiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYCR7VGFnU2VydmljZS5lbmRwb2ludH0vdGFncy8ke3VzZXJFbWFpbH0vJHtzb25nSWR9LyR7dGFnTmFtZX1gXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFRhZ1NlcnZpY2UucG9zdCh1cmwpLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXHJcbiAgICB9XHJcbiAgICBzdGF0aWMgYXN5bmMgZGVsZXRlVGFnKHVzZXJFbWFpbDogc3RyaW5nLCBzb25nSWQ6c3RyaW5nLCB0YWdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPFRhZz4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGAke1RhZ1NlcnZpY2UuZW5kcG9pbnR9L3RhZ3MvJHt1c2VyRW1haWx9LyR7c29uZ0lkfS8ke3RhZ05hbWV9YFxyXG4gICAgICAgIHJldHVybiBhd2FpdCBUYWdTZXJ2aWNlLmRlbGV0ZSh1cmwpLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGdldChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgY29uc3QgcGFyYW1zOiBSZXF1ZXN0SW5pdCA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxyXG4gICAgICAgICAgICBtb2RlOiAnY29ycycgYXMgUmVxdWVzdE1vZGVcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBUYWdTZXJ2aWNlLmZldGNoV2l0aEVycm9ySGFuZGxpbmcocGF0aCwgcGFyYW1zKVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGFzeW5jIHBvc3QocGF0aDogc3RyaW5nLCBib2R5PzogYW55KTogUHJvbWlzZTxSZXNwb25zZT4ge1xyXG4gICAgICAgIGNvbnN0IHBhcmFtczogUmVxdWVzdEluaXQgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcclxuICAgICAgICAgICAgbW9kZTogJ2NvcnMnIGFzIFJlcXVlc3RNb2RlXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoYm9keSkge1xyXG4gICAgICAgICAgICBwYXJhbXMuaGVhZGVycyA9IHtcclxuICAgICAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBwYXJhbXMuYm9keSA9IEpTT04uc3RyaW5naWZ5KGJvZHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gVGFnU2VydmljZS5mZXRjaFdpdGhFcnJvckhhbmRsaW5nKHBhdGgsIHBhcmFtcylcclxuICAgIH1cclxuICAgIHN0YXRpYyBhc3luYyBkZWxldGUocGF0aDogc3RyaW5nLCBib2R5PzogYW55KTogUHJvbWlzZTxSZXNwb25zZT4ge1xyXG4gICAgICAgIGNvbnN0IHBhcmFtczogUmVxdWVzdEluaXQgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJERUxFVEVcIixcclxuICAgICAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxyXG4gICAgICAgICAgICBtb2RlOiAnY29ycycgYXMgUmVxdWVzdE1vZGVcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChib2R5KSB7XHJcbiAgICAgICAgICAgIHBhcmFtcy5oZWFkZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHBhcmFtcy5ib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBUYWdTZXJ2aWNlLmZldGNoV2l0aEVycm9ySGFuZGxpbmcocGF0aCwgcGFyYW1zKVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGFzeW5jIGZldGNoV2l0aEVycm9ySGFuZGxpbmcocGF0aDpzdHJpbmcsIHBhcmFtczphbnkpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZTogUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChwYXRoLCBwYXJhbXMpO1xyXG4gICAgICAgICAgICBpZighcmVzcG9uc2Uub2spIHRocm93IHJlc3BvbnNlXHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBsb2dnZXIud2FybihlcnJvciwgYCR7cGFyYW1zLm1ldGhvZH0gcmVxdWVzdCBmYWlsZWQgZm9yICR7cGF0aH0hYClcclxuICAgICAgICAgICAgcmV0dXJuIFJlc3BvbnNlLmVycm9yKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IFRhZ1NlcnZpY2UgfSBmcm9tICcuLi8uLi9UYWdTZXJ2aWNlJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcidcblxuaW1wb3J0IHN0eWxlcyBmcm9tIFwiLi9UYWdCb3hBZGRCdXR0b24ubW9kdWxlLnNjc3NcIlxuXG5leHBvcnQgY2xhc3MgVGFnIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIGRhdGU6IHN0cmluZztcbiAgICBwcmlvcml0eTogbnVtYmVyO1xuICAgIGNvbnN0cnVjdG9yIChuYW1lOiBzdHJpbmcsIHR5cGU6IHN0cmluZyA9IFwibm9ybWFsXCIsIGRhdGU6IHN0cmluZyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmRhdGUgPSBkYXRlO1xuICAgICAgICB0aGlzLnByaW9yaXR5ID0gNTAwXG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGFnQm94IHtcbiAgICB1c2VyRW1haWw6IHN0cmluZztcbiAgICBzb25nSWQ6IHN0cmluZztcbiAgICB0YWdzOiBNYXA8c3RyaW5nLCBUYWc+O1xuXG4gICAgZGl2RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpbnB1dEVsOiBIVE1MSW5wdXRFbGVtZW50O1xuXG4gICAgY29uc3RydWN0b3IgKHVzZXJFbWFpbDogc3RyaW5nLCBzb25nSWQ6c3RyaW5nLCB0YWdzOiBNYXA8c3RyaW5nLCBUYWc+ID0gbmV3IE1hcDxzdHJpbmcsIFRhZz4oKSkge1xuICAgICAgICB0aGlzLnVzZXJFbWFpbCA9IHVzZXJFbWFpbFxuICAgICAgICB0aGlzLnNvbmdJZCA9IHNvbmdJZFxuICAgICAgICB0aGlzLnRhZ3MgPSB0YWdzXG5cbiAgICAgICAgLy8gU2V0dXAgdGhlIGRpdiBhbmQgaW5wdXQgZWxlbWVudCBcbiAgICAgICAgdGhpcy5kaXZFbC5jbGFzc0xpc3QuYWRkKFwidGFnYm94XCIpO1xuICAgICAgICB0aGlzLmRpdkVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0OiBhbnkpID0+IGV2dC5zdG9wUHJvcGFnYXRpb24oKSk7IC8vIE9yIGVsc2Ugd2UgdHJpZ2dlciB5b3V0dWJlcyBjbGljayBoYW5kbGVyIGFuZCBlbnRlciB0aGUgc29uZyBvbiBwbGF5bGlzdCBwYWdlXG4gICAgICAgIHRoaXMuZGl2RWwuaW5uZXJIVE1MID0gXG4gICAgICAgIGBcbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7c3R5bGVzWyd0ZXh0LWlucHV0J119XCI+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cImAgKyBzb25nSWQgKyBgXCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiYCArIHNvbmdJZCArIGBcIiBjbGFzcz0ke3N0eWxlc1sndGFnbGFiZWwnXX0+KzwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBgXG4gICAgICAgIHRoaXMuaW5wdXRFbCA9IHRoaXMuZGl2RWwucXVlcnlTZWxlY3RvcihcImlucHV0XCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXG4gICAgICAgIHRoaXMuaW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgdGhpcy5hZGRUYWcuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy8gRmlyc3QgcmVuZGVyIG9mIHRoZSB0YWdzXG4gICAgICAgIHRhZ3MuZm9yRWFjaCh0YWcgPT4gdGhpcy5hZGRUYWdGcm9udGVuZCh0YWcpKVxuICAgIH1cblxuICAgIGFzeW5jIGFkZFRhZyhlOktleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgaWYgKGUua2V5ICE9PSAnRW50ZXInKSByZXR1cm47XG4gICAgICAgIGxldCBpbnB1dEVsID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgbGV0IHRhZ05hbWUgPSBpbnB1dEVsLnZhbHVlLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgICAgbGV0IHRhZzogVGFnID0gYXdhaXQgVGFnU2VydmljZS5zZXRUYWcodGhpcy51c2VyRW1haWwsIHRoaXMuc29uZ0lkLCB0YWdOYW1lKSBcbiAgICAgICAgaWYodGhpcy50YWdzLmhhcyh0YWcubmFtZSkpIHJldHVyblxuICAgICAgICBsb2dnZXIuaW5mbyhcIkFkZGluZyB0YWc6IFwiLCB0YWcpXG4gICAgICAgIHRoaXMuYWRkVGFnRnJvbnRlbmQodGFnKVxuICAgIH1cblxuICAgIGFkZFRhZ0Zyb250ZW5kKHRhZzogVGFnKSB7XG4gICAgICAgIGxldCBhbmNob3JUYWc6IEhUTUxBbmNob3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBhbmNob3JUYWcuaHJlZiA9IFwiamF2YXNjcmlwdDo7XCI7XG4gICAgICAgIGFuY2hvclRhZy5jbGFzc0xpc3QuYWRkKFwicGlsbFwiKTtcbiAgICAgICAgYW5jaG9yVGFnLmNsYXNzTGlzdC5hZGQodGFnLnR5cGUpOyAvLyB3aWxsIGJlIHVzZWQgdG8gZ2l2ZSBkaWZmZXJlbnQgY29sb3IgdG8gdGFnc1xuICAgICAgICBhbmNob3JUYWcuaW5uZXJIVE1MID0gYFxcIyR7dGFnLm5hbWV9IGBcbiAgICAgICAgbGV0IGRlbGV0ZVRhZ0JvdW5kID0gdGhpcy5kZWxldGVUYWcuYmluZCh0aGlzKTtcbiAgICAgICAgYW5jaG9yVGFnLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2dCkgPT4gZGVsZXRlVGFnQm91bmQoZXZ0LCB0YWcubmFtZSkpO1xuICAgICAgICB0aGlzLmRpdkVsLmluc2VydEFkamFjZW50RWxlbWVudChcImFmdGVyYmVnaW5cIiwgYW5jaG9yVGFnKTtcbiAgICB9XG5cbiAgICBhc3luYyBkZWxldGVUYWcoZXZ0Ok1vdXNlRXZlbnQsIHRhZ05hbWU6IHN0cmluZyl7XG4gICAgICAgIGxldCBlbGVtZW50ID0gZXZ0LnRhcmdldCBhcyBFbGVtZW50O1xuICAgICAgICBjb25zb2xlLmxvZygnUmVtb3ZpbmcgdGFnIGVsZW1lbnQ6JywgZWxlbWVudCk7XG4gICAgICAgIGlmKCFlbGVtZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMudGFncy5kZWxldGUodGFnTmFtZSlcbiAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgVGFnU2VydmljZS5kZWxldGVUYWcodGhpcy51c2VyRW1haWwsIHRoaXMuc29uZ0lkLCB0YWdOYW1lKTtcbiAgICB9XG59IiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQgZGVmYXVsdCB7XCJ0ZXh0LWlucHV0XCI6XCJ5SUtkYXdjWkdpemZoU3BQR0RPR1wiLFwidGFnbGFiZWxcIjpcIklSVjYzYzRLZjUydFc3TDUzZXZXXCJ9OyIsIid1c2Ugc3RyaWN0J1xuZnVuY3Rpb24gdHJ5U3RyaW5naWZ5IChvKSB7XG4gIHRyeSB7IHJldHVybiBKU09OLnN0cmluZ2lmeShvKSB9IGNhdGNoKGUpIHsgcmV0dXJuICdcIltDaXJjdWxhcl1cIicgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvcm1hdFxuXG5mdW5jdGlvbiBmb3JtYXQoZiwgYXJncywgb3B0cykge1xuICB2YXIgc3MgPSAob3B0cyAmJiBvcHRzLnN0cmluZ2lmeSkgfHwgdHJ5U3RyaW5naWZ5XG4gIHZhciBvZmZzZXQgPSAxXG4gIGlmICh0eXBlb2YgZiA9PT0gJ29iamVjdCcgJiYgZiAhPT0gbnVsbCkge1xuICAgIHZhciBsZW4gPSBhcmdzLmxlbmd0aCArIG9mZnNldFxuICAgIGlmIChsZW4gPT09IDEpIHJldHVybiBmXG4gICAgdmFyIG9iamVjdHMgPSBuZXcgQXJyYXkobGVuKVxuICAgIG9iamVjdHNbMF0gPSBzcyhmKVxuICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBsZW47IGluZGV4KyspIHtcbiAgICAgIG9iamVjdHNbaW5kZXhdID0gc3MoYXJnc1tpbmRleF0pXG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKVxuICB9XG4gIGlmICh0eXBlb2YgZiAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZlxuICB9XG4gIHZhciBhcmdMZW4gPSBhcmdzLmxlbmd0aFxuICBpZiAoYXJnTGVuID09PSAwKSByZXR1cm4gZlxuICB2YXIgc3RyID0gJydcbiAgdmFyIGEgPSAxIC0gb2Zmc2V0XG4gIHZhciBsYXN0UG9zID0gLTFcbiAgdmFyIGZsZW4gPSAoZiAmJiBmLmxlbmd0aCkgfHwgMFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGZsZW47KSB7XG4gICAgaWYgKGYuY2hhckNvZGVBdChpKSA9PT0gMzcgJiYgaSArIDEgPCBmbGVuKSB7XG4gICAgICBsYXN0UG9zID0gbGFzdFBvcyA+IC0xID8gbGFzdFBvcyA6IDBcbiAgICAgIHN3aXRjaCAoZi5jaGFyQ29kZUF0KGkgKyAxKSkge1xuICAgICAgICBjYXNlIDEwMDogLy8gJ2QnXG4gICAgICAgIGNhc2UgMTAyOiAvLyAnZidcbiAgICAgICAgICBpZiAoYSA+PSBhcmdMZW4pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIChhcmdzW2FdID09IG51bGwpICBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9IE51bWJlcihhcmdzW2FdKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMTA1OiAvLyAnaSdcbiAgICAgICAgICBpZiAoYSA+PSBhcmdMZW4pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIChhcmdzW2FdID09IG51bGwpICBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9IE1hdGguZmxvb3IoTnVtYmVyKGFyZ3NbYV0pKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNzk6IC8vICdPJ1xuICAgICAgICBjYXNlIDExMTogLy8gJ28nXG4gICAgICAgIGNhc2UgMTA2OiAvLyAnaidcbiAgICAgICAgICBpZiAoYSA+PSBhcmdMZW4pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIChhcmdzW2FdID09PSB1bmRlZmluZWQpIGJyZWFrXG4gICAgICAgICAgaWYgKGxhc3RQb3MgPCBpKVxuICAgICAgICAgICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcywgaSlcbiAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBhcmdzW2FdXG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBzdHIgKz0gJ1xcJycgKyBhcmdzW2FdICsgJ1xcJydcbiAgICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc3RyICs9IGFyZ3NbYV0ubmFtZSB8fCAnPGFub255bW91cz4nXG4gICAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3RyICs9IHNzKGFyZ3NbYV0pXG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgaSsrXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAxMTU6IC8vICdzJ1xuICAgICAgICAgIGlmIChhID49IGFyZ0xlbilcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgaWYgKGxhc3RQb3MgPCBpKVxuICAgICAgICAgICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcywgaSlcbiAgICAgICAgICBzdHIgKz0gU3RyaW5nKGFyZ3NbYV0pXG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgaSsrXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzNzogLy8gJyUnXG4gICAgICAgICAgaWYgKGxhc3RQb3MgPCBpKVxuICAgICAgICAgICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcywgaSlcbiAgICAgICAgICBzdHIgKz0gJyUnXG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgaSsrXG4gICAgICAgICAgYS0tXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgICsrYVxuICAgIH1cbiAgICArK2lcbiAgfVxuICBpZiAobGFzdFBvcyA9PT0gLTEpXG4gICAgcmV0dXJuIGZcbiAgZWxzZSBpZiAobGFzdFBvcyA8IGZsZW4pIHtcbiAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zKVxuICB9XG5cbiAgcmV0dXJuIHN0clxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGZvcm1hdCA9IHJlcXVpcmUoJ3F1aWNrLWZvcm1hdC11bmVzY2FwZWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBpbm9cblxuY29uc3QgX2NvbnNvbGUgPSBwZkdsb2JhbFRoaXNPckZhbGxiYWNrKCkuY29uc29sZSB8fCB7fVxuY29uc3Qgc3RkU2VyaWFsaXplcnMgPSB7XG4gIG1hcEh0dHBSZXF1ZXN0OiBtb2NrLFxuICBtYXBIdHRwUmVzcG9uc2U6IG1vY2ssXG4gIHdyYXBSZXF1ZXN0U2VyaWFsaXplcjogcGFzc3Rocm91Z2gsXG4gIHdyYXBSZXNwb25zZVNlcmlhbGl6ZXI6IHBhc3N0aHJvdWdoLFxuICB3cmFwRXJyb3JTZXJpYWxpemVyOiBwYXNzdGhyb3VnaCxcbiAgcmVxOiBtb2NrLFxuICByZXM6IG1vY2ssXG4gIGVycjogYXNFcnJWYWx1ZVxufVxuXG5mdW5jdGlvbiBzaG91bGRTZXJpYWxpemUgKHNlcmlhbGl6ZSwgc2VyaWFsaXplcnMpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc2VyaWFsaXplKSkge1xuICAgIGNvbnN0IGhhc1RvRmlsdGVyID0gc2VyaWFsaXplLmZpbHRlcihmdW5jdGlvbiAoaykge1xuICAgICAgcmV0dXJuIGsgIT09ICchc3RkU2VyaWFsaXplcnMuZXJyJ1xuICAgIH0pXG4gICAgcmV0dXJuIGhhc1RvRmlsdGVyXG4gIH0gZWxzZSBpZiAoc2VyaWFsaXplID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHNlcmlhbGl6ZXJzKVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHBpbm8gKG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge31cbiAgb3B0cy5icm93c2VyID0gb3B0cy5icm93c2VyIHx8IHt9XG5cbiAgY29uc3QgdHJhbnNtaXQgPSBvcHRzLmJyb3dzZXIudHJhbnNtaXRcbiAgaWYgKHRyYW5zbWl0ICYmIHR5cGVvZiB0cmFuc21pdC5zZW5kICE9PSAnZnVuY3Rpb24nKSB7IHRocm93IEVycm9yKCdwaW5vOiB0cmFuc21pdCBvcHRpb24gbXVzdCBoYXZlIGEgc2VuZCBmdW5jdGlvbicpIH1cblxuICBjb25zdCBwcm90byA9IG9wdHMuYnJvd3Nlci53cml0ZSB8fCBfY29uc29sZVxuICBpZiAob3B0cy5icm93c2VyLndyaXRlKSBvcHRzLmJyb3dzZXIuYXNPYmplY3QgPSB0cnVlXG4gIGNvbnN0IHNlcmlhbGl6ZXJzID0gb3B0cy5zZXJpYWxpemVycyB8fCB7fVxuICBjb25zdCBzZXJpYWxpemUgPSBzaG91bGRTZXJpYWxpemUob3B0cy5icm93c2VyLnNlcmlhbGl6ZSwgc2VyaWFsaXplcnMpXG4gIGxldCBzdGRFcnJTZXJpYWxpemUgPSBvcHRzLmJyb3dzZXIuc2VyaWFsaXplXG5cbiAgaWYgKFxuICAgIEFycmF5LmlzQXJyYXkob3B0cy5icm93c2VyLnNlcmlhbGl6ZSkgJiZcbiAgICBvcHRzLmJyb3dzZXIuc2VyaWFsaXplLmluZGV4T2YoJyFzdGRTZXJpYWxpemVycy5lcnInKSA+IC0xXG4gICkgc3RkRXJyU2VyaWFsaXplID0gZmFsc2VcblxuICBjb25zdCBsZXZlbHMgPSBbJ2Vycm9yJywgJ2ZhdGFsJywgJ3dhcm4nLCAnaW5mbycsICdkZWJ1ZycsICd0cmFjZSddXG5cbiAgaWYgKHR5cGVvZiBwcm90byA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHByb3RvLmVycm9yID0gcHJvdG8uZmF0YWwgPSBwcm90by53YXJuID1cbiAgICBwcm90by5pbmZvID0gcHJvdG8uZGVidWcgPSBwcm90by50cmFjZSA9IHByb3RvXG4gIH1cbiAgaWYgKG9wdHMuZW5hYmxlZCA9PT0gZmFsc2UgfHwgb3B0cy5icm93c2VyLmRpc2FibGVkKSBvcHRzLmxldmVsID0gJ3NpbGVudCdcbiAgY29uc3QgbGV2ZWwgPSBvcHRzLmxldmVsIHx8ICdpbmZvJ1xuICBjb25zdCBsb2dnZXIgPSBPYmplY3QuY3JlYXRlKHByb3RvKVxuICBpZiAoIWxvZ2dlci5sb2cpIGxvZ2dlci5sb2cgPSBub29wXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZ2dlciwgJ2xldmVsVmFsJywge1xuICAgIGdldDogZ2V0TGV2ZWxWYWxcbiAgfSlcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZ2dlciwgJ2xldmVsJywge1xuICAgIGdldDogZ2V0TGV2ZWwsXG4gICAgc2V0OiBzZXRMZXZlbFxuICB9KVxuXG4gIGNvbnN0IHNldE9wdHMgPSB7XG4gICAgdHJhbnNtaXQsXG4gICAgc2VyaWFsaXplLFxuICAgIGFzT2JqZWN0OiBvcHRzLmJyb3dzZXIuYXNPYmplY3QsXG4gICAgbGV2ZWxzLFxuICAgIHRpbWVzdGFtcDogZ2V0VGltZUZ1bmN0aW9uKG9wdHMpXG4gIH1cbiAgbG9nZ2VyLmxldmVscyA9IHBpbm8ubGV2ZWxzXG4gIGxvZ2dlci5sZXZlbCA9IGxldmVsXG5cbiAgbG9nZ2VyLnNldE1heExpc3RlbmVycyA9IGxvZ2dlci5nZXRNYXhMaXN0ZW5lcnMgPVxuICBsb2dnZXIuZW1pdCA9IGxvZ2dlci5hZGRMaXN0ZW5lciA9IGxvZ2dlci5vbiA9XG4gIGxvZ2dlci5wcmVwZW5kTGlzdGVuZXIgPSBsb2dnZXIub25jZSA9XG4gIGxvZ2dlci5wcmVwZW5kT25jZUxpc3RlbmVyID0gbG9nZ2VyLnJlbW92ZUxpc3RlbmVyID1cbiAgbG9nZ2VyLnJlbW92ZUFsbExpc3RlbmVycyA9IGxvZ2dlci5saXN0ZW5lcnMgPVxuICBsb2dnZXIubGlzdGVuZXJDb3VudCA9IGxvZ2dlci5ldmVudE5hbWVzID1cbiAgbG9nZ2VyLndyaXRlID0gbG9nZ2VyLmZsdXNoID0gbm9vcFxuICBsb2dnZXIuc2VyaWFsaXplcnMgPSBzZXJpYWxpemVyc1xuICBsb2dnZXIuX3NlcmlhbGl6ZSA9IHNlcmlhbGl6ZVxuICBsb2dnZXIuX3N0ZEVyclNlcmlhbGl6ZSA9IHN0ZEVyclNlcmlhbGl6ZVxuICBsb2dnZXIuY2hpbGQgPSBjaGlsZFxuXG4gIGlmICh0cmFuc21pdCkgbG9nZ2VyLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoKVxuXG4gIGZ1bmN0aW9uIGdldExldmVsVmFsICgpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbCA9PT0gJ3NpbGVudCdcbiAgICAgID8gSW5maW5pdHlcbiAgICAgIDogdGhpcy5sZXZlbHMudmFsdWVzW3RoaXMubGV2ZWxdXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMZXZlbCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xldmVsXG4gIH1cbiAgZnVuY3Rpb24gc2V0TGV2ZWwgKGxldmVsKSB7XG4gICAgaWYgKGxldmVsICE9PSAnc2lsZW50JyAmJiAhdGhpcy5sZXZlbHMudmFsdWVzW2xldmVsXSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ3Vua25vd24gbGV2ZWwgJyArIGxldmVsKVxuICAgIH1cbiAgICB0aGlzLl9sZXZlbCA9IGxldmVsXG5cbiAgICBzZXQoc2V0T3B0cywgbG9nZ2VyLCAnZXJyb3InLCAnbG9nJykgLy8gPC0tIG11c3Qgc3RheSBmaXJzdFxuICAgIHNldChzZXRPcHRzLCBsb2dnZXIsICdmYXRhbCcsICdlcnJvcicpXG4gICAgc2V0KHNldE9wdHMsIGxvZ2dlciwgJ3dhcm4nLCAnZXJyb3InKVxuICAgIHNldChzZXRPcHRzLCBsb2dnZXIsICdpbmZvJywgJ2xvZycpXG4gICAgc2V0KHNldE9wdHMsIGxvZ2dlciwgJ2RlYnVnJywgJ2xvZycpXG4gICAgc2V0KHNldE9wdHMsIGxvZ2dlciwgJ3RyYWNlJywgJ2xvZycpXG4gIH1cblxuICBmdW5jdGlvbiBjaGlsZCAoYmluZGluZ3MsIGNoaWxkT3B0aW9ucykge1xuICAgIGlmICghYmluZGluZ3MpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyBiaW5kaW5ncyBmb3IgY2hpbGQgUGlubycpXG4gICAgfVxuICAgIGNoaWxkT3B0aW9ucyA9IGNoaWxkT3B0aW9ucyB8fCB7fVxuICAgIGlmIChzZXJpYWxpemUgJiYgYmluZGluZ3Muc2VyaWFsaXplcnMpIHtcbiAgICAgIGNoaWxkT3B0aW9ucy5zZXJpYWxpemVycyA9IGJpbmRpbmdzLnNlcmlhbGl6ZXJzXG4gICAgfVxuICAgIGNvbnN0IGNoaWxkT3B0aW9uc1NlcmlhbGl6ZXJzID0gY2hpbGRPcHRpb25zLnNlcmlhbGl6ZXJzXG4gICAgaWYgKHNlcmlhbGl6ZSAmJiBjaGlsZE9wdGlvbnNTZXJpYWxpemVycykge1xuICAgICAgdmFyIGNoaWxkU2VyaWFsaXplcnMgPSBPYmplY3QuYXNzaWduKHt9LCBzZXJpYWxpemVycywgY2hpbGRPcHRpb25zU2VyaWFsaXplcnMpXG4gICAgICB2YXIgY2hpbGRTZXJpYWxpemUgPSBvcHRzLmJyb3dzZXIuc2VyaWFsaXplID09PSB0cnVlXG4gICAgICAgID8gT2JqZWN0LmtleXMoY2hpbGRTZXJpYWxpemVycylcbiAgICAgICAgOiBzZXJpYWxpemVcbiAgICAgIGRlbGV0ZSBiaW5kaW5ncy5zZXJpYWxpemVyc1xuICAgICAgYXBwbHlTZXJpYWxpemVycyhbYmluZGluZ3NdLCBjaGlsZFNlcmlhbGl6ZSwgY2hpbGRTZXJpYWxpemVycywgdGhpcy5fc3RkRXJyU2VyaWFsaXplKVxuICAgIH1cbiAgICBmdW5jdGlvbiBDaGlsZCAocGFyZW50KSB7XG4gICAgICB0aGlzLl9jaGlsZExldmVsID0gKHBhcmVudC5fY2hpbGRMZXZlbCB8IDApICsgMVxuICAgICAgdGhpcy5lcnJvciA9IGJpbmQocGFyZW50LCBiaW5kaW5ncywgJ2Vycm9yJylcbiAgICAgIHRoaXMuZmF0YWwgPSBiaW5kKHBhcmVudCwgYmluZGluZ3MsICdmYXRhbCcpXG4gICAgICB0aGlzLndhcm4gPSBiaW5kKHBhcmVudCwgYmluZGluZ3MsICd3YXJuJylcbiAgICAgIHRoaXMuaW5mbyA9IGJpbmQocGFyZW50LCBiaW5kaW5ncywgJ2luZm8nKVxuICAgICAgdGhpcy5kZWJ1ZyA9IGJpbmQocGFyZW50LCBiaW5kaW5ncywgJ2RlYnVnJylcbiAgICAgIHRoaXMudHJhY2UgPSBiaW5kKHBhcmVudCwgYmluZGluZ3MsICd0cmFjZScpXG4gICAgICBpZiAoY2hpbGRTZXJpYWxpemVycykge1xuICAgICAgICB0aGlzLnNlcmlhbGl6ZXJzID0gY2hpbGRTZXJpYWxpemVyc1xuICAgICAgICB0aGlzLl9zZXJpYWxpemUgPSBjaGlsZFNlcmlhbGl6ZVxuICAgICAgfVxuICAgICAgaWYgKHRyYW5zbWl0KSB7XG4gICAgICAgIHRoaXMuX2xvZ0V2ZW50ID0gY3JlYXRlTG9nRXZlbnRTaGFwZShcbiAgICAgICAgICBbXS5jb25jYXQocGFyZW50Ll9sb2dFdmVudC5iaW5kaW5ncywgYmluZGluZ3MpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gICAgQ2hpbGQucHJvdG90eXBlID0gdGhpc1xuICAgIHJldHVybiBuZXcgQ2hpbGQodGhpcylcbiAgfVxuICByZXR1cm4gbG9nZ2VyXG59XG5cbnBpbm8ubGV2ZWxzID0ge1xuICB2YWx1ZXM6IHtcbiAgICBmYXRhbDogNjAsXG4gICAgZXJyb3I6IDUwLFxuICAgIHdhcm46IDQwLFxuICAgIGluZm86IDMwLFxuICAgIGRlYnVnOiAyMCxcbiAgICB0cmFjZTogMTBcbiAgfSxcbiAgbGFiZWxzOiB7XG4gICAgMTA6ICd0cmFjZScsXG4gICAgMjA6ICdkZWJ1ZycsXG4gICAgMzA6ICdpbmZvJyxcbiAgICA0MDogJ3dhcm4nLFxuICAgIDUwOiAnZXJyb3InLFxuICAgIDYwOiAnZmF0YWwnXG4gIH1cbn1cblxucGluby5zdGRTZXJpYWxpemVycyA9IHN0ZFNlcmlhbGl6ZXJzXG5waW5vLnN0ZFRpbWVGdW5jdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG51bGxUaW1lLCBlcG9jaFRpbWUsIHVuaXhUaW1lLCBpc29UaW1lIH0pXG5cbmZ1bmN0aW9uIHNldCAob3B0cywgbG9nZ2VyLCBsZXZlbCwgZmFsbGJhY2spIHtcbiAgY29uc3QgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YobG9nZ2VyKVxuICBsb2dnZXJbbGV2ZWxdID0gbG9nZ2VyLmxldmVsVmFsID4gbG9nZ2VyLmxldmVscy52YWx1ZXNbbGV2ZWxdXG4gICAgPyBub29wXG4gICAgOiAocHJvdG9bbGV2ZWxdID8gcHJvdG9bbGV2ZWxdIDogKF9jb25zb2xlW2xldmVsXSB8fCBfY29uc29sZVtmYWxsYmFja10gfHwgbm9vcCkpXG5cbiAgd3JhcChvcHRzLCBsb2dnZXIsIGxldmVsKVxufVxuXG5mdW5jdGlvbiB3cmFwIChvcHRzLCBsb2dnZXIsIGxldmVsKSB7XG4gIGlmICghb3B0cy50cmFuc21pdCAmJiBsb2dnZXJbbGV2ZWxdID09PSBub29wKSByZXR1cm5cblxuICBsb2dnZXJbbGV2ZWxdID0gKGZ1bmN0aW9uICh3cml0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiBMT0cgKCkge1xuICAgICAgY29uc3QgdHMgPSBvcHRzLnRpbWVzdGFtcCgpXG4gICAgICBjb25zdCBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpXG4gICAgICBjb25zdCBwcm90byA9IChPYmplY3QuZ2V0UHJvdG90eXBlT2YgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpID09PSBfY29uc29sZSkgPyBfY29uc29sZSA6IHRoaXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXVxuXG4gICAgICBpZiAob3B0cy5zZXJpYWxpemUgJiYgIW9wdHMuYXNPYmplY3QpIHtcbiAgICAgICAgYXBwbHlTZXJpYWxpemVycyhhcmdzLCB0aGlzLl9zZXJpYWxpemUsIHRoaXMuc2VyaWFsaXplcnMsIHRoaXMuX3N0ZEVyclNlcmlhbGl6ZSlcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLmFzT2JqZWN0KSB3cml0ZS5jYWxsKHByb3RvLCBhc09iamVjdCh0aGlzLCBsZXZlbCwgYXJncywgdHMpKVxuICAgICAgZWxzZSB3cml0ZS5hcHBseShwcm90bywgYXJncylcblxuICAgICAgaWYgKG9wdHMudHJhbnNtaXQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNtaXRMZXZlbCA9IG9wdHMudHJhbnNtaXQubGV2ZWwgfHwgbG9nZ2VyLmxldmVsXG4gICAgICAgIGNvbnN0IHRyYW5zbWl0VmFsdWUgPSBwaW5vLmxldmVscy52YWx1ZXNbdHJhbnNtaXRMZXZlbF1cbiAgICAgICAgY29uc3QgbWV0aG9kVmFsdWUgPSBwaW5vLmxldmVscy52YWx1ZXNbbGV2ZWxdXG4gICAgICAgIGlmIChtZXRob2RWYWx1ZSA8IHRyYW5zbWl0VmFsdWUpIHJldHVyblxuICAgICAgICB0cmFuc21pdCh0aGlzLCB7XG4gICAgICAgICAgdHMsXG4gICAgICAgICAgbWV0aG9kTGV2ZWw6IGxldmVsLFxuICAgICAgICAgIG1ldGhvZFZhbHVlLFxuICAgICAgICAgIHRyYW5zbWl0TGV2ZWwsXG4gICAgICAgICAgdHJhbnNtaXRWYWx1ZTogcGluby5sZXZlbHMudmFsdWVzW29wdHMudHJhbnNtaXQubGV2ZWwgfHwgbG9nZ2VyLmxldmVsXSxcbiAgICAgICAgICBzZW5kOiBvcHRzLnRyYW5zbWl0LnNlbmQsXG4gICAgICAgICAgdmFsOiBsb2dnZXIubGV2ZWxWYWxcbiAgICAgICAgfSwgYXJncylcbiAgICAgIH1cbiAgICB9XG4gIH0pKGxvZ2dlcltsZXZlbF0pXG59XG5cbmZ1bmN0aW9uIGFzT2JqZWN0IChsb2dnZXIsIGxldmVsLCBhcmdzLCB0cykge1xuICBpZiAobG9nZ2VyLl9zZXJpYWxpemUpIGFwcGx5U2VyaWFsaXplcnMoYXJncywgbG9nZ2VyLl9zZXJpYWxpemUsIGxvZ2dlci5zZXJpYWxpemVycywgbG9nZ2VyLl9zdGRFcnJTZXJpYWxpemUpXG4gIGNvbnN0IGFyZ3NDbG9uZWQgPSBhcmdzLnNsaWNlKClcbiAgbGV0IG1zZyA9IGFyZ3NDbG9uZWRbMF1cbiAgY29uc3QgbyA9IHt9XG4gIGlmICh0cykge1xuICAgIG8udGltZSA9IHRzXG4gIH1cbiAgby5sZXZlbCA9IHBpbm8ubGV2ZWxzLnZhbHVlc1tsZXZlbF1cbiAgbGV0IGx2bCA9IChsb2dnZXIuX2NoaWxkTGV2ZWwgfCAwKSArIDFcbiAgaWYgKGx2bCA8IDEpIGx2bCA9IDFcbiAgLy8gZGVsaWJlcmF0ZSwgY2F0Y2hpbmcgb2JqZWN0cywgYXJyYXlzXG4gIGlmIChtc2cgIT09IG51bGwgJiYgdHlwZW9mIG1zZyA9PT0gJ29iamVjdCcpIHtcbiAgICB3aGlsZSAobHZsLS0gJiYgdHlwZW9mIGFyZ3NDbG9uZWRbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3QuYXNzaWduKG8sIGFyZ3NDbG9uZWQuc2hpZnQoKSlcbiAgICB9XG4gICAgbXNnID0gYXJnc0Nsb25lZC5sZW5ndGggPyBmb3JtYXQoYXJnc0Nsb25lZC5zaGlmdCgpLCBhcmdzQ2xvbmVkKSA6IHVuZGVmaW5lZFxuICB9IGVsc2UgaWYgKHR5cGVvZiBtc2cgPT09ICdzdHJpbmcnKSBtc2cgPSBmb3JtYXQoYXJnc0Nsb25lZC5zaGlmdCgpLCBhcmdzQ2xvbmVkKVxuICBpZiAobXNnICE9PSB1bmRlZmluZWQpIG8ubXNnID0gbXNnXG4gIHJldHVybiBvXG59XG5cbmZ1bmN0aW9uIGFwcGx5U2VyaWFsaXplcnMgKGFyZ3MsIHNlcmlhbGl6ZSwgc2VyaWFsaXplcnMsIHN0ZEVyclNlcmlhbGl6ZSkge1xuICBmb3IgKGNvbnN0IGkgaW4gYXJncykge1xuICAgIGlmIChzdGRFcnJTZXJpYWxpemUgJiYgYXJnc1tpXSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBhcmdzW2ldID0gcGluby5zdGRTZXJpYWxpemVycy5lcnIoYXJnc1tpXSlcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmdzW2ldID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShhcmdzW2ldKSkge1xuICAgICAgZm9yIChjb25zdCBrIGluIGFyZ3NbaV0pIHtcbiAgICAgICAgaWYgKHNlcmlhbGl6ZSAmJiBzZXJpYWxpemUuaW5kZXhPZihrKSA+IC0xICYmIGsgaW4gc2VyaWFsaXplcnMpIHtcbiAgICAgICAgICBhcmdzW2ldW2tdID0gc2VyaWFsaXplcnNba10oYXJnc1tpXVtrXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBiaW5kIChwYXJlbnQsIGJpbmRpbmdzLCBsZXZlbCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGFyZ3MgPSBuZXcgQXJyYXkoMSArIGFyZ3VtZW50cy5sZW5ndGgpXG4gICAgYXJnc1swXSA9IGJpbmRpbmdzXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2kgLSAxXVxuICAgIH1cbiAgICByZXR1cm4gcGFyZW50W2xldmVsXS5hcHBseSh0aGlzLCBhcmdzKVxuICB9XG59XG5cbmZ1bmN0aW9uIHRyYW5zbWl0IChsb2dnZXIsIG9wdHMsIGFyZ3MpIHtcbiAgY29uc3Qgc2VuZCA9IG9wdHMuc2VuZFxuICBjb25zdCB0cyA9IG9wdHMudHNcbiAgY29uc3QgbWV0aG9kTGV2ZWwgPSBvcHRzLm1ldGhvZExldmVsXG4gIGNvbnN0IG1ldGhvZFZhbHVlID0gb3B0cy5tZXRob2RWYWx1ZVxuICBjb25zdCB2YWwgPSBvcHRzLnZhbFxuICBjb25zdCBiaW5kaW5ncyA9IGxvZ2dlci5fbG9nRXZlbnQuYmluZGluZ3NcblxuICBhcHBseVNlcmlhbGl6ZXJzKFxuICAgIGFyZ3MsXG4gICAgbG9nZ2VyLl9zZXJpYWxpemUgfHwgT2JqZWN0LmtleXMobG9nZ2VyLnNlcmlhbGl6ZXJzKSxcbiAgICBsb2dnZXIuc2VyaWFsaXplcnMsXG4gICAgbG9nZ2VyLl9zdGRFcnJTZXJpYWxpemUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBsb2dnZXIuX3N0ZEVyclNlcmlhbGl6ZVxuICApXG4gIGxvZ2dlci5fbG9nRXZlbnQudHMgPSB0c1xuICBsb2dnZXIuX2xvZ0V2ZW50Lm1lc3NhZ2VzID0gYXJncy5maWx0ZXIoZnVuY3Rpb24gKGFyZykge1xuICAgIC8vIGJpbmRpbmdzIGNhbiBvbmx5IGJlIG9iamVjdHMsIHNvIHJlZmVyZW5jZSBlcXVhbGl0eSBjaGVjayB2aWEgaW5kZXhPZiBpcyBmaW5lXG4gICAgcmV0dXJuIGJpbmRpbmdzLmluZGV4T2YoYXJnKSA9PT0gLTFcbiAgfSlcblxuICBsb2dnZXIuX2xvZ0V2ZW50LmxldmVsLmxhYmVsID0gbWV0aG9kTGV2ZWxcbiAgbG9nZ2VyLl9sb2dFdmVudC5sZXZlbC52YWx1ZSA9IG1ldGhvZFZhbHVlXG5cbiAgc2VuZChtZXRob2RMZXZlbCwgbG9nZ2VyLl9sb2dFdmVudCwgdmFsKVxuXG4gIGxvZ2dlci5fbG9nRXZlbnQgPSBjcmVhdGVMb2dFdmVudFNoYXBlKGJpbmRpbmdzKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVMb2dFdmVudFNoYXBlIChiaW5kaW5ncykge1xuICByZXR1cm4ge1xuICAgIHRzOiAwLFxuICAgIG1lc3NhZ2VzOiBbXSxcbiAgICBiaW5kaW5nczogYmluZGluZ3MgfHwgW10sXG4gICAgbGV2ZWw6IHsgbGFiZWw6ICcnLCB2YWx1ZTogMCB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNFcnJWYWx1ZSAoZXJyKSB7XG4gIGNvbnN0IG9iaiA9IHtcbiAgICB0eXBlOiBlcnIuY29uc3RydWN0b3IubmFtZSxcbiAgICBtc2c6IGVyci5tZXNzYWdlLFxuICAgIHN0YWNrOiBlcnIuc3RhY2tcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBpbiBlcnIpIHtcbiAgICBpZiAob2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgb2JqW2tleV0gPSBlcnJba2V5XVxuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqXG59XG5cbmZ1bmN0aW9uIGdldFRpbWVGdW5jdGlvbiAob3B0cykge1xuICBpZiAodHlwZW9mIG9wdHMudGltZXN0YW1wID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG9wdHMudGltZXN0YW1wXG4gIH1cbiAgaWYgKG9wdHMudGltZXN0YW1wID09PSBmYWxzZSkge1xuICAgIHJldHVybiBudWxsVGltZVxuICB9XG4gIHJldHVybiBlcG9jaFRpbWVcbn1cblxuZnVuY3Rpb24gbW9jayAoKSB7IHJldHVybiB7fSB9XG5mdW5jdGlvbiBwYXNzdGhyb3VnaCAoYSkgeyByZXR1cm4gYSB9XG5mdW5jdGlvbiBub29wICgpIHt9XG5cbmZ1bmN0aW9uIG51bGxUaW1lICgpIHsgcmV0dXJuIGZhbHNlIH1cbmZ1bmN0aW9uIGVwb2NoVGltZSAoKSB7IHJldHVybiBEYXRlLm5vdygpIH1cbmZ1bmN0aW9uIHVuaXhUaW1lICgpIHsgcmV0dXJuIE1hdGgucm91bmQoRGF0ZS5ub3coKSAvIDEwMDAuMCkgfVxuZnVuY3Rpb24gaXNvVGltZSAoKSB7IHJldHVybiBuZXcgRGF0ZShEYXRlLm5vdygpKS50b0lTT1N0cmluZygpIH0gLy8gdXNpbmcgRGF0ZS5ub3coKSBmb3IgdGVzdGFiaWxpdHlcblxuLyogZXNsaW50LWRpc2FibGUgKi9cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBwZkdsb2JhbFRoaXNPckZhbGxiYWNrICgpIHtcbiAgZnVuY3Rpb24gZGVmZCAobykgeyByZXR1cm4gdHlwZW9mIG8gIT09ICd1bmRlZmluZWQnICYmIG8gfVxuICB0cnkge1xuICAgIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVybiBnbG9iYWxUaGlzXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICdnbG9iYWxUaGlzJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRlbGV0ZSBPYmplY3QucHJvdG90eXBlLmdsb2JhbFRoaXNcbiAgICAgICAgcmV0dXJuICh0aGlzLmdsb2JhbFRoaXMgPSB0aGlzKVxuICAgICAgfSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG4gICAgcmV0dXJuIGdsb2JhbFRoaXNcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBkZWZkKHNlbGYpIHx8IGRlZmQod2luZG93KSB8fCBkZWZkKHRoaXMpIHx8IHt9XG4gIH1cbn1cbi8qIGVzbGludC1lbmFibGUgKi9cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgVGFnQm94IH0gZnJvbSAnLi9jb21wb25lbnRzL1RhZ0JveC9UYWdCb3gnO1xuaW1wb3J0IHsgVGFnU2VydmljZSB9IGZyb20gJy4vVGFnU2VydmljZSc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL2xvZ2dlcidcblxuY29uc3QgdXNlckVtYWlsID0gXCJhamF5dW1hc2Fua2FyQGdtYWlsLmNvbVwiXG5jb25zdCBkZWxheSA9ICh0Om51bWJlcikgPT4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIHQpKTtcblxud2luZG93Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCBUYWdTZXJ2aWNlLmdldEVuZHBvaW50KCk7XG4gICAgY29uc3QgY3VycmVudFVybDogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgY29uc3QgcGxheWxpc3RSZWdleDogUmVnRXhwID0gbmV3IFJlZ0V4cCgneW91dHViZVxcLmNvbVxcL3BsYXlsaXN0XFxcXD9saXN0PScsICdpJylcbiAgICBpZiAocGxheWxpc3RSZWdleC50ZXN0KGN1cnJlbnRVcmwpKSBkZWxheSgzMDAwKS50aGVuKCgpID0+IGluamVjdFRhZ0JveFRvUGxheWxpc3RJdGVtcygpKTtcbiAgICBjb25zdCBwbGF5bGlzdFNvbmdSZWdleDogUmVnRXhwID0gbmV3IFJlZ0V4cCgneW91dHViZS5jb20vd2F0Y2hcXFxcP3Y9KC4qKVxcJmxpc3Q9JywgJ2knKVxuICAgIGlmIChwbGF5bGlzdFNvbmdSZWdleC50ZXN0KGN1cnJlbnRVcmwpKSB7XG4gICAgICAgIHdhaXRGb3JZb3V0dWJlKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBpbmplY3RUYWdCb3hUb1NvbmcoKSB7XG4gICAgLy8gcHJpbWFyeUVsLnF1ZXJ5U2VsZWN0b3IoXCJkaXYud2F0Y2gtYWN0aXZlLW1ldGFkYXRhIGRpdjpudGgtY2hpbGQoMilcIilcbiAgICBjb25zdCBwbGF5bGlzdE5hbWVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2gzIHl0LWZvcm1hdHRlZC1zdHJpbmcgYVtocmVmXj1cIi9wbGF5bGlzdFwiXScpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuICAgIGNvbnN0IGNoYW5uZWxOYW1lRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd5dC1mb3JtYXR0ZWQtc3RyaW5nW2NsYXNzKj1cInl0ZC1jaGFubmVsLW5hbWVcIl0gYScpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuICAgIGNvbnN0IHNvbmdOYW1lRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2W2lkPVxcXCJjb250YWluZXJcXFwiXSBoMSB5dC1mb3JtYXR0ZWQtc3RyaW5nXCIpIGFzIEhUTUxFbGVtZW50XG5cbiAgICBjb25zdCB0YWdzID0gYXdhaXQgVGFnU2VydmljZS5nZXRUYWdzKHVzZXJFbWFpbCwgZ2V0U29uZ0lkKHdpbmRvdy5sb2NhdGlvbi5ocmVmKSwgc29uZ05hbWVFbC5pbm5lclRleHQsIGdldFBsYXlsaXN0SWQod2luZG93LmxvY2F0aW9uLmhyZWYpLCBwbGF5bGlzdE5hbWVFbC5pbm5lclRleHQsIGNoYW5uZWxOYW1lRWwuaW5uZXJUZXh0KVxuICAgIGxvZ2dlci5pbmZvKFwiQWRkaW5nIHRhZ2JveCB0byBjdXJyZW50bHkgcGxheWluZyBzb25nXCIsIHtcbiAgICAgICAgXCJVc2VyIEVtYWlsXCI6IHVzZXJFbWFpbCxcbiAgICAgICAgXCJTb25nIElEXCI6IGdldFNvbmdJZCh3aW5kb3cubG9jYXRpb24uaHJlZiksXG4gICAgICAgIFwiU29uZyBOYW1lXCI6IHNvbmdOYW1lRWwuaW5uZXJUZXh0LFxuICAgICAgICBcIlBsYXlsaXN0IElEXCI6IGdldFBsYXlsaXN0SWQod2luZG93LmxvY2F0aW9uLmhyZWYpLFxuICAgICAgICBcIlBsYXlsaXN0IE5hbWU6XCI6IHBsYXlsaXN0TmFtZUVsLmlubmVyVGV4dCxcbiAgICAgICAgXCJDaGFubmVsIE5hbWVcIjogY2hhbm5lbE5hbWVFbC5pbm5lclRleHQsXG4gICAgICAgIFwiVGFnc1wiOiB0YWdzXG4gICAgfSlcbiAgICBjb25zdCB0YWdCb3hFbCA9IG5ldyBUYWdCb3godXNlckVtYWlsLCBnZXRTb25nSWQod2luZG93LmxvY2F0aW9uLmhyZWYpLCB0YWdzKVxuXG4gICAgY29uc3QgYmVsb3dUaGVQbGF5ZXJFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXZbaWQ9XFxcImFib3ZlLXRoZS1mb2xkXFxcIl1cIikgYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgYmVsb3dUaGVQbGF5ZXJFbC5pbnNlcnRCZWZvcmUodGFnQm94RWwuZGl2RWwsIGJlbG93VGhlUGxheWVyRWwuZmlyc3RDaGlsZCk7XG59XG5cbmZ1bmN0aW9uIGluamVjdFRhZ0JveFRvUGxheWxpc3RJdGVtcygpIHtcbiAgICAvLyBUcmF2ZXJzaW5nIHRoZSBBY3R1YWwgU29uZyBQYW5lc1xuICAgIGNvbnN0IGRpc3BsYXlEaWFsb2dFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNkaXNwbGF5LWRpYWxvZycpWzBdIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgIGNvbnN0IHNvbmdQYW5lczogTm9kZUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2IHl0ZC1wbGF5bGlzdC12aWRlby1yZW5kZXJlclwiKTsgXG4gICAgY29uc29sZS5sb2coc29uZ1BhbmVzKVxuICAgIHNvbmdQYW5lcy5mb3JFYWNoKGFzeW5jIChzb25nUGFuZSkgID0+IHtcbiAgICAgICAgbGV0IHNvbmdQYW5lRWwgPSBzb25nUGFuZSBhcyBFbGVtZW50O1xuXG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGRpdiB0aGF0IHJlcHJlc2VudHMgdGhlIHdob2xlIHJvd1xuICAgICAgICBjb25zdCBjb250ZW50RWwgPSBzb25nUGFuZUVsLmNoaWxkcmVuWzFdIGFzIEhUTUxEaXZFbGVtZW50O1xuXG4gICAgICAgIC8vIFRoaXMgaXMgeW91dHViZXMgY29udGFpbmVyIGVsZW1lbnQgaW5jbHVkaW5nIHdoaWNoIGNvbnRhaW5zIHRoZSB0aHVtYm5haWwgYW5kIG1ldGFkYXRhXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lckVsID0gY29udGVudEVsLmNoaWxkcmVuWzBdIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb250YWluZXJFbC5zdHlsZS5hbGlnbkl0ZW1zID0gJ2NlbnRlcic7XG4gICAgICAgIGNvbnRlbnRFbC5zdHlsZS5mbGV4V3JhcCA9ICdub3dyYXAnXG5cbiAgICAgICAgLy8gV2l0aGluIHRoZSB0aHVtYm5haWwgd2UgY2FuIGdldCB0aGUgaHJlZlxuICAgICAgICBjb25zdCB0aHVtYm5haWxFbCA9IGNvbnRhaW5lckVsLmNoaWxkcmVuWzBdIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBjb25zdCBhbmNob3JFbCA9IHRodW1ibmFpbEVsLmNoaWxkcmVuWzBdIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuXG4gICAgICAgIC8vIFdpdGhpbiB0aGUgbWV0YWRhdGEgd2UgY2FuIGdldCB0aGUgc29uZyB0aXRsZSwgYXV0aG9yXG4gICAgICAgIGNvbnN0IG1ldGFFbCA9IGNvbnRhaW5lckVsLmNoaWxkcmVuWzFdO1xuICAgICAgICBjb25zdCBtZXRhRGF0YUVsID0gbWV0YUVsLmNoaWxkcmVuWzFdLmNoaWxkcmVuWzBdIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBjaGFubmVsTmFtZUNvbnRhaW5lckVsID0gbWV0YURhdGFFbC5jaGlsZHJlblswXS5jaGlsZHJlblswXS5jaGlsZHJlblswXSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgY29uc3QgY2hhbm5lbE5hbWVFbCA9IGNoYW5uZWxOYW1lQ29udGFpbmVyRWwuY2hpbGRyZW5bMF0uY2hpbGRyZW5bMF0uY2hpbGRyZW5bMF0gYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG5cbiAgICAgICAgY29uc3Qgc29uZ05hbWVFbCA9IG1ldGFFbC5jaGlsZHJlblswXS5jaGlsZHJlblsxXSBhcyBIVE1MQW5jaG9yRWxlbWVudFxuICAgICAgICBjb25zdCBwbGF5bGlzdE5hbWVFbCA9IGRpc3BsYXlEaWFsb2dFbC5jaGlsZHJlblsxXSBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgICBjb25zdCB0YWdzID0gYXdhaXQgVGFnU2VydmljZS5nZXRUYWdzKHVzZXJFbWFpbCwgZ2V0U29uZ0lkKGFuY2hvckVsLmhyZWYpLCBzb25nTmFtZUVsLmlubmVyVGV4dCwgZ2V0UGxheWxpc3RJZCh3aW5kb3cubG9jYXRpb24uaHJlZiksIHBsYXlsaXN0TmFtZUVsLmlubmVyVGV4dCwgY2hhbm5lbE5hbWVFbC5pbm5lclRleHQpXG4gICAgICAgIGxvZ2dlci5pbmZvKFwiQWRkaW5nIHRhZ2JveCB0byBwbGF5bGlzdCBpdGVtXCIsIHtcbiAgICAgICAgICAgIFwiVXNlciBFbWFpbFwiOiB1c2VyRW1haWwsXG4gICAgICAgICAgICBcIlNvbmcgSURcIjogZ2V0U29uZ0lkKGFuY2hvckVsLmhyZWYpLFxuICAgICAgICAgICAgXCJTb25nIE5hbWVcIjogc29uZ05hbWVFbC5pbm5lclRleHQsXG4gICAgICAgICAgICBcIlBsYXlsaXN0IElEXCI6IGdldFBsYXlsaXN0SWQod2luZG93LmxvY2F0aW9uLmhyZWYpLFxuICAgICAgICAgICAgXCJQbGF5bGlzdCBOYW1lOlwiOiBwbGF5bGlzdE5hbWVFbC5pbm5lclRleHQsXG4gICAgICAgICAgICBcIkNoYW5uZWwgTmFtZVwiOiBjaGFubmVsTmFtZUVsLmlubmVyVGV4dCxcbiAgICAgICAgICAgIFwiVGFnc1wiOiB0YWdzXG4gICAgICAgIH0pXG5cbiAgICAgICAgY29uc3QgdGFnQm94RWwgPSBuZXcgVGFnQm94KHVzZXJFbWFpbCwgZ2V0U29uZ0lkKGFuY2hvckVsLmhyZWYpLCB0YWdzKVxuICAgICAgICBjb250ZW50RWwuYXBwZW5kQ2hpbGQodGFnQm94RWwuZGl2RWwpO1xuICAgIH0pXG59XG5cbmNvbnN0IHdhaXRGb3JZb3V0dWJlID0gYXN5bmMgKHJvb3RFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSA9PiB7XG4gICAgbGV0IHNlbGVjdG9yOmFueSA9ICdhYm92ZS10aGUtZm9sZCdcbiAgICBjb25zb2xlLmxvZyhgV2FpdGluZyBmb3IgJHtzZWxlY3Rvcn0uLi5gLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xuICAgIGxldCBjb25maWcgPSB7XG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICB9XG4gICAgLy8gRmlyc3QsIGF0dGFjaCB0YWcgYm94IHdoZW4gdGhlIGVsZW1lbnQgaXMgZm91bmRcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtzZWxlY3Rvcn0gd2FzIGZvdW5kIWAsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpOyAgICAgICAgICAgICAgICAgIC8vIHRoaXMgbXVzdCBjb21lIGZpcnN0IG9yIGVsc2Ugd2UgaW5maW5pdGUgbG9vcCBzaW5jZSB3ZSBtb2RpZnkgYWJvdmUtdGhlLWZvbGRcbiAgICAgICAgICAgICAgICBhd2FpdCBpbmplY3RUYWdCb3hUb1NvbmcoKTsgICAgICAgIFxuICAgICAgICAgICAgICAgIHJlc29sdmUoZWxlbWVudCBhcyBIVE1MRGl2RWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHJvb3RFbGVtZW50LCBjb25maWcpO1xuICAgIH0pLnRoZW4oZWxlbWVudCA9PiB7XG4gICAgLy8gU2Vjb25kbHksIHRoaXMgaXMgZm9yIHdoZW4gd2UgZ28gdG8gYSBuZXcgc29uZyBhbmQgdGhlIGVsZW1lbnQgY2hhbmdlc1xuICAgICAgICBzZWxlY3RvciA9ICdkaXYjYWJvdmUtdGhlLWZvbGQgZGl2I3RpdGxlIGgxJyAvLyBlbGVtZW50IHRoYXQgaG9sZHMgdGl0bGVcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb25DaGFuZ2VkID0gYXN5bmMgZnVuY3Rpb24gKG11dGF0aW9uc0xpc3Q6YW55LCBvYnNlcnZlcjphbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDaGFuZ2VzIGRldGVjdGVkIGluICR7c2VsZWN0b3J9YCwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIGF3YWl0IGRlbGV0ZVRhZ0JveGVzKCk7XG4gICAgICAgICAgICBhd2FpdCBpbmplY3RUYWdCb3hUb1NvbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGVzY3JpcHRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGRlc2NyaXB0aW9uQ2hhbmdlZClcbiAgICAgICAgZGVzY3JpcHRpb25PYnNlcnZlci5vYnNlcnZlKChlbGVtZW50IGFzIEhUTUxEaXZFbGVtZW50KS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSwgY29uZmlnKVxuICAgIH0pXG59O1xuXG5cblxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVUYWdCb3hlcygpIHtcbiAgICBjb25zdCB0YWdCb3hXcmFwcGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50YWdib3gnKSBhcyBOb2RlTGlzdE9mPEVsZW1lbnQ+O1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiB0YWdCb3hXcmFwcGVycykge1xuICAgICAgICBlbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0U29uZ0lkKGhyZWY6IHN0cmluZykge1xuICAgIGNvbnN0IHJlZ2V4cDogUmVnRXhwID0gL3dhdGNoXFw/dj0oLio/KVxcJi9pO1xuICAgIGNvbnN0IHJlc3VsdDogUmVnRXhwTWF0Y2hBcnJheSA9IGhyZWYubWF0Y2gocmVnZXhwKSBhcyBSZWdFeHBNYXRjaEFycmF5O1xuICAgIHJldHVybiByZXN1bHRbMV07XG59XG5cbmZ1bmN0aW9uIGdldFBsYXlsaXN0SWQoaHJlZjogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVnZXhwOiBSZWdFeHAgPSAvbGlzdD0oW2EtekEtWjAtOV8tXSspL2k7XG4gICAgY29uc3QgcmVzdWx0OiBSZWdFeHBNYXRjaEFycmF5ID0gaHJlZi5tYXRjaChyZWdleHApIGFzIFJlZ0V4cE1hdGNoQXJyYXk7XG4gICAgcmV0dXJuIHJlc3VsdFsxXTtcbn1cblxuXG5cblxuXG5cbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsImltcG9ydCB7IFRhZ1NlcnZpY2UgfSBmcm9tIFwiLi4vLi4vY29udGVudHNjcmlwdC9UYWdTZXJ2aWNlXCI7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCIuLi8uLi9jb250ZW50c2NyaXB0L2xvZ2dlclwiO1xyXG4vLyBpdHMgYWN0dWFsbHkgY3JhenkgaG93IGp1c3QgaW5jbHVkaW5nIHRoaXMgZmlsZSBpbiB3ZWJwYWNrIGNhbiBsZXQgeW91IHJlc29sdmUgdGhlIGltcG9ydHMgYWJvdmUgaW5zdGFudGx5LiB3aXRob3V0IGl0LCB3ZSBjcmFzaFxyXG4vLyBhbmQgc29tZWhvdyB3ZSBzdGlsbCByZXRhaW4gdGhlIHBhdGhpbmcgb2Ygb3VyIGltcG9ydHMgY29ycmVjdGx5Li5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgVGFnU2VydmljZS5nZXRFbmRwb2ludCgpLnRoZW4oKGVuZHBvaW50KSA9PiB7XHJcbiAgICAgICAgbGV0IHVybCA9IGAke2VuZHBvaW50fS90YWdzL2FqYXl1bWFzYW5rYXJAZ21haWwuY29tL2BcclxuICAgICAgICAkKCcjdGFncycpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICBhamF4OiB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgICAgICAgICBkZWxheTogMjUwLCAvLyB3YWl0IDI1MCBtaWxsaXNlY29uZHMgYmVmb3JlIHRyaWdnZXJpbmcgdGhlIHJlcXVlc3RcclxuICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnlQYXJhbWV0ZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXJtOiBwYXJhbXMudGVybSA/IHBhcmFtcy50ZXJtIDogXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcXVlcnlQYXJhbWV0ZXJzO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IGRhdGEucmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KSAgICBcclxufSk7XHJcblxyXG5cclxuIl0sIm5hbWVzIjpbImxvZ2dlciIsIlRhZ1NlcnZpY2UiLCJlbmRwb2ludCIsImdldEVuZHBvaW50IiwiaGVhbHRoVXJsIiwicmVzIiwiZ2V0IiwidHlwZSIsIndhcm4iLCJnZXRUYWdzIiwidXNlckVtYWlsIiwic29uZ0lkIiwic29uZ05hbWUiLCJwbGF5bGlzdElkIiwicGxheWxpc3ROYW1lIiwidXBsb2FkZXIiLCJlbmNvZGVVUklDb21wb25lbnQiLCJ1cmwiLCJ0aGVuIiwianNvbiIsInRhZ3NPYmoiLCJ0YWdzTWFwIiwiTWFwIiwiT2JqZWN0IiwiZW50cmllcyIsInNldFRhZyIsInRhZ05hbWUiLCJwb3N0IiwiZGVsZXRlVGFnIiwiZGVsZXRlIiwicGF0aCIsInBhcmFtcyIsIm1ldGhvZCIsInJlZGlyZWN0IiwibW9kZSIsImZldGNoV2l0aEVycm9ySGFuZGxpbmciLCJib2R5IiwiaGVhZGVycyIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZXNwb25zZSIsImZldGNoIiwib2siLCJlcnJvciIsIlJlc3BvbnNlIiwic3R5bGVzIiwiVGFnIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiZGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInByaW9yaXR5IiwiVGFnQm94IiwiZGl2RWwiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0YWdzIiwiY2xhc3NMaXN0IiwiYWRkIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2dCIsInN0b3BQcm9wYWdhdGlvbiIsImlubmVySFRNTCIsImlucHV0RWwiLCJxdWVyeVNlbGVjdG9yIiwiYWRkVGFnIiwiYmluZCIsImZvckVhY2giLCJ0YWciLCJhZGRUYWdGcm9udGVuZCIsImUiLCJrZXkiLCJ0YXJnZXQiLCJ2YWx1ZSIsInJlcGxhY2UiLCJoYXMiLCJpbmZvIiwiYW5jaG9yVGFnIiwiaHJlZiIsImRlbGV0ZVRhZ0JvdW5kIiwiaW5zZXJ0QWRqYWNlbnRFbGVtZW50IiwiZWxlbWVudCIsImNvbnNvbGUiLCJsb2ciLCJyZW1vdmUiLCJkZWxheSIsInQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiLCJ3aW5kb3ciLCJvbmxvYWQiLCJjdXJyZW50VXJsIiwibG9jYXRpb24iLCJwbGF5bGlzdFJlZ2V4IiwiUmVnRXhwIiwidGVzdCIsImluamVjdFRhZ0JveFRvUGxheWxpc3RJdGVtcyIsInBsYXlsaXN0U29uZ1JlZ2V4Iiwid2FpdEZvcllvdXR1YmUiLCJpbmplY3RUYWdCb3hUb1NvbmciLCJwbGF5bGlzdE5hbWVFbCIsImNoYW5uZWxOYW1lRWwiLCJzb25nTmFtZUVsIiwiZ2V0U29uZ0lkIiwiaW5uZXJUZXh0IiwiZ2V0UGxheWxpc3RJZCIsInRhZ0JveEVsIiwiYmVsb3dUaGVQbGF5ZXJFbCIsImluc2VydEJlZm9yZSIsImZpcnN0Q2hpbGQiLCJkaXNwbGF5RGlhbG9nRWwiLCJxdWVyeVNlbGVjdG9yQWxsIiwic29uZ1BhbmVzIiwic29uZ1BhbmUiLCJzb25nUGFuZUVsIiwiY29udGVudEVsIiwiY2hpbGRyZW4iLCJjb250YWluZXJFbCIsInN0eWxlIiwiYWxpZ25JdGVtcyIsImZsZXhXcmFwIiwidGh1bWJuYWlsRWwiLCJhbmNob3JFbCIsIm1ldGFFbCIsIm1ldGFEYXRhRWwiLCJjaGFubmVsTmFtZUNvbnRhaW5lckVsIiwiYXBwZW5kQ2hpbGQiLCJyb290RWxlbWVudCIsImRvY3VtZW50RWxlbWVudCIsInNlbGVjdG9yIiwiY29uZmlnIiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsImdldEVsZW1lbnRCeUlkIiwiZGlzY29ubmVjdCIsIm9ic2VydmUiLCJkZXNjcmlwdGlvbkNoYW5nZWQiLCJtdXRhdGlvbnNMaXN0IiwiZGVsZXRlVGFnQm94ZXMiLCJkZXNjcmlwdGlvbk9ic2VydmVyIiwidGFnQm94V3JhcHBlcnMiLCJyZWdleHAiLCJyZXN1bHQiLCJtYXRjaCJdLCJzb3VyY2VSb290IjoiIn0=