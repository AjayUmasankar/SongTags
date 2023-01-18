/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/BackendNotifier.ts":
/*!*******************************************!*\
  !*** ./src/components/BackendNotifier.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BackendNotifier": () => (/* binding */ BackendNotifier)
/* harmony export */ });
class BackendNotifier {
  //static tagsResource: string = "https://songtagsbackend.herokuapp.com/tags/ajay/"
  // static ajayTagsEndpoint: string = "http://127.0.0.1:8000/tags/ajay/"
  static tagsEndpoint = "http://127.0.0.1:8000/tags";

  static async updateTagsForSong(username, href, tags) {
    const es6maptojson = JSON.stringify(Object.fromEntries(tags.entries()));
    return (await fetch(BackendNotifier.tagsEndpoint + "/" + username + "/" + href, {
      method: 'POST',
      redirect: 'follow',
      mode: 'cors',
      body: es6maptojson
    }).then(response => {
      let responsetext = response.text();
      return responsetext;
    }).catch(error => console.log('error', error))) || '{}';
  }

  static async getTags(username, href, uploader, songname, playlistName) {
    const getTagsUrl = `${BackendNotifier.tagsEndpoint}/${username}/${href}/?uploader=${uploader}&songname=${songname}&playlistName=${playlistName}`;
    let tagsString = (await fetch(getTagsUrl, {
      method: 'GET',
      redirect: 'follow',
      mode: 'cors' // Dont pass in body into GET params, some framewokrs dont play nice with it

    }).then(response => {
      let responsetext = response.text();
      return responsetext;
    }).catch(error => console.log('error', error))) || '{}';
    return tagsString;
  }

}

/***/ }),

/***/ "./src/components/TagBox/TagBox.ts":
/*!*****************************************!*\
  !*** ./src/components/TagBox/TagBox.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TagBox": () => (/* binding */ TagBox),
/* harmony export */   "TagData": () => (/* binding */ TagData)
/* harmony export */ });
/* harmony import */ var _BackendNotifier__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BackendNotifier */ "./src/components/BackendNotifier.ts");

class TagData {
  constructor(type = "default", date = new Date().toISOString()) {
    this.type = type;
    this.date = date;

    if (type == "artist") {
      this.position = 50;
    } else if (type == "uploader") {
      this.position = 100;
    } else if (type == "default") {
      this.position = 999;
    } else {
      this.position = 150;
    }
  }

}
class TagBox {
  constructor(href, uploader, songname, playlistName) {
    // this = document.createElement('div');
    // let tagBoxDiv: Element = document.createElement('DIV');
    this.playlistName = playlistName;
    this.href = href;
    this.tags = new Map();
    this.maxTags = 10, this.divEl = document.createElement('DIV');

    if (playlistName === "Watch later") {
      // this.ul = document.createElement('ul') as HTMLUListElement;
      this.input = document.createElement('input');
    } else {
      this.divEl.classList.add("tagbox");
      this.divEl.addEventListener("click", evt => evt.stopPropagation()); // Or else we trigger youtubes click handler and enter the song

      this.divEl.innerHTML = `
                <div class="text-input">
                    <input type="text" id="` + href + `" placeholder="">
                    <label for="` + href + `" class=taglabel>+</label>
                </div>
            `;
      this.input = this.divEl.querySelector("input"), this.input.addEventListener("keyup", this.addTagFromUser.bind(this)); // Let backend do all the work of getting tags!

      _BackendNotifier__WEBPACK_IMPORTED_MODULE_0__.BackendNotifier.getTags("ajay", this.href, uploader, songname, playlistName).then(tagsString => {
        let tags = new Map(Object.entries(JSON.parse(tagsString)));
        this.tags = tags;
        this.rebuildTags(); // needed for first runthrough
      });
    }
  } // We use this map to enable bulk updates instead of one by one whenever a change occurs
  // addTags(automatedTags: Map<string, TagData>, backendTags:Map<string, TagData>) {


  addTags(tags) {
    let isNewTag = false;
    tags.forEach((value, key) => {
      isNewTag = this.addTagToLocal(key, value.type);
    });

    if (isNewTag) {
      _BackendNotifier__WEBPACK_IMPORTED_MODULE_0__.BackendNotifier.updateTagsForSong("ajay", this.href, this.tags);
      this.rebuildTags();
    } // Need to do this for first time only to create tags on frontend

  }

  addTagToLocal(tagName, type = "default") {
    // Can have up to 10 tags. No duplicates. Minimum length = 1
    let isNewTag = false;

    if (!this.tags.has(tagName)) {
      isNewTag = true;
      if (this.tags.size >= 10) return false;
      this.tags.set(tagName, new TagData(type));
    }

    return isNewTag;
  } // Reads input field and adds the tag


  addTagFromUser(e) {
    if (e.key !== 'Enter') return;
    let inputEl = e.target;
    let tagName = inputEl.value.replace(/\s+/g, ' ');
    this.addTags(new Map([[tagName, new TagData("default")]]));
    inputEl.value = "";
  }

  removeTag(evt, tagName) {
    let element = evt.target;
    console.log('Removing tag element:', element);
    if (!element) return;
    this.tags.delete(tagName);
    element.remove();
    _BackendNotifier__WEBPACK_IMPORTED_MODULE_0__.BackendNotifier.updateTagsForSong("ajay", this.href, this.tags);
  } // Rebuilds the tag box contents for the associated href


  rebuildTags() {
    this.divEl.querySelectorAll("a").forEach(li => li.remove());
    this.tags.forEach((tag, key) => {
      let anchorTag = document.createElement('a');
      anchorTag.href = "javascript:;";
      anchorTag.classList.add("pill");
      anchorTag.classList.add(tag.type); // will be used to give different color to tags

      anchorTag.innerHTML = `\#${key} `;
      let removeTagBound = this.removeTag.bind(this);
      anchorTag.addEventListener('click', evt => removeTagBound(evt, key));
      this.divEl.insertAdjacentElement("afterbegin", anchorTag);
    });
  }

  parseData(songname, uploader, playlistName) {
    let tagsToAdd = new Map();
    let artistFound = false;
    /* Vocaloid */
    // const mikuRegex = new RegExp('Miku|ミク', 'i')
    // if (mikuRegex.test(songname)) tagsToAdd.set("ミク", new TagData("vocaloid"));
    // /* Game and Anime */
    // const gameRegex = new RegExp('(Blue Archive|Counterside|Lost Ark|Arknights)', 'i')
    // const gameMatch = songname.match(gameRegex)
    // if (gameMatch) {tagsToAdd.set(gameMatch[1].trim(), new TagData("game")); artistFound = true;}

    /*******************************************************************
     *      Regex to parse uploader name (and try to find artist)      *
     *******************************************************************/
    // Case 0 - Artist already fouind 

    if (artistFound) return tagsToAdd; // Case 3 - Found artist by removing \

    const slashRegex = new RegExp('(.*?) \/');
    var result = uploader.match(slashRegex);

    if (result) {
      tagsToAdd.set(result[1], new TagData("artist"));
      return tagsToAdd;
    } // Case 5 - Found artist that has まふまふちゃんねる


    const ちゃんねるInUploaderNameRegex = new RegExp('(.*?)ちゃんねる', 'i');
    var result = uploader.match(ちゃんねるInUploaderNameRegex);

    if (result) {
      tagsToAdd.set(result[1], new TagData("artist"));
      return tagsToAdd;
    } // Case 998 - Delimit on '-' lmao..


    const dashRegex = new RegExp('(.*?) -.*');
    var result = songname.match(dashRegex);

    if (result) {
      tagsToAdd.set(result[1], new TagData("artist"));
      return tagsToAdd;
    } // Case 999 - Return uploader only.. artist not found


    tagsToAdd.set(uploader, new TagData("uploader"));
    return tagsToAdd;
  }

}

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
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/TagBoxInjector.ts ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_TagBox_TagBox__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/TagBox/TagBox */ "./src/components/TagBox/TagBox.ts");


const delay = t => new Promise(resolve => setTimeout(resolve, t));

window.onload = () => {
  const currentUrl = window.location.href;
  const playlistRegex = new RegExp('youtube\.com\/playlist\\?list=', 'i');
  if (playlistRegex.test(currentUrl)) injectTagBoxToPlaylistItems();
  const playlistSongRegex = new RegExp('youtube.com/watch\\?v=(.*)\&list=', 'i');
  if (playlistSongRegex.test(currentUrl)) waitForYoutube();
};

function injectTagBoxToSong() {
  // primaryEl.querySelector("div.watch-active-metadata div:nth-child(2)")
  var playlistNameEl = document.querySelector('h3 yt-formatted-string a[href^="/playlist"]');
  var channelNameEl = document.querySelector('yt-formatted-string[class*="ytd-channel-name"] a');
  var songNameEl = document.querySelector("div[id=\"container\"] h1 yt-formatted-string");
  console.log(`Playlist Name: ${playlistNameEl.innerText} \nChannel Name: ${channelNameEl.innerText} \nSong Name: ${songNameEl.innerText}`);
  const belowThePlayerEl = document.querySelector("div[id=\"above-the-fold\"]");
  const tagBoxEl = new _components_TagBox_TagBox__WEBPACK_IMPORTED_MODULE_0__.TagBox(parseHref(window.location.href), channelNameEl.innerText, songNameEl.innerText, playlistNameEl.innerText);
  belowThePlayerEl.insertBefore(tagBoxEl.divEl, belowThePlayerEl.firstChild);
  console.log("Added tagbox to currently playing song", new Date().toISOString());
}

function injectTagBoxToPlaylistItems() {
  // Traversing the Actual Song Panes
  const displayDialogEl = document.querySelectorAll('#display-dialog')[0]; // console.log(playlistNameEl);
  // console.log(playlistNameEl.innerText);

  const songPanes = document.querySelectorAll("div ytd-playlist-video-renderer");
  songPanes.forEach(songPane => {
    let songPaneEl = songPane; // This is the div that represents the whole row

    const contentEl = songPaneEl.children[1]; // This is youtubes container element including which contains the thumbnail and metadata

    const containerEl = contentEl.children[0];
    containerEl.style.alignItems = 'center';
    contentEl.style.flexWrap = 'nowrap'; // Within the thumbnail we can get the href

    const thumbnailEl = containerEl.children[0];
    const anchorEl = thumbnailEl.children[0]; // Within the metadata we can get the song title, author

    const metaEl = containerEl.children[1];
    const metaDataEl = metaEl.children[1].children[0];
    const channelNameContainerEl = metaDataEl.children[0].children[0].children[0];
    const channelNameEl = channelNameContainerEl.children[0].children[0].children[0];
    const songNameEl = metaEl.children[0].children[1];
    const playlistNameEl = displayDialogEl.children[1];
    const tagBoxEl = new _components_TagBox_TagBox__WEBPACK_IMPORTED_MODULE_0__.TagBox(parseHref(anchorEl.href), channelNameEl.innerText, songNameEl.innerText, playlistNameEl.innerText);
    console.log('This songs parsed url is: ', parseHref(anchorEl.href));
    contentEl.appendChild(tagBoxEl.divEl);
  });
}

const waitForYoutube = async (rootElement = document.documentElement) => {
  let selector = 'above-the-fold';
  console.log(`Waiting for ${selector}...`, new Date().toISOString());
  let config = {
    childList: true,
    subtree: true
  }; // First, do stuff when element spawns

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
    // Second, do stuff whenever that element changes
    selector = 'div#above-the-fold div#title h1'; // element that holds title

    const descriptionChanged = function (mutationsList, observer) {
      console.log(mutationsList);
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

function parseHref(href) {
  const regexp = /watch\?v=(.*?)\&/i;
  const result = href.match(regexp);
  return result[1];
} // function startHrefObserver(currenthref: string) {
//     var bodyList = document.querySelector("body") as HTMLBodyElement;
//     var observer = new MutationObserver(function(mutations) {
//         mutations.forEach(function(mutation) {
//             if (currenthref != window.location.href) {
//                 console.log("Observer detected href change", new Date().toISOString());
//                 console.log("Current: " + currenthref, "Old: " + window.location.href);
//                 currenthref = window.location.href;
//                 deleteTagBoxes();
//                 initializeTagBoxes();
//             }
//         });
//     });
//     var config = {
//         childList: true,
//         subtree: true
//     };
//     observer.observe(bodyList, config);
// }
})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
/*!*******************************************************!*\
  !*** ./src/components/TagAddButton/TagAddButton.scss ***!
  \*******************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "src/components/TagAddButton/TagAddButton.css");
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUF2Qjs7RUFDQSxLQUFLLE1BQU1ILE9BQVgsSUFBc0J5RSxjQUF0QixFQUFzQztJQUNsQ3pFLE9BQU8sQ0FBQ0UsTUFBUjtFQUNIO0FBQ0o7O0FBR0QsU0FBU3FDLFNBQVQsQ0FBbUIxRyxJQUFuQixFQUFpQztFQUM3QixNQUFNNkksTUFBYyxHQUFHLG1CQUF2QjtFQUNBLE1BQU01RCxNQUF3QixHQUFHakYsSUFBSSxDQUFDa0YsS0FBTCxDQUFXMkQsTUFBWCxDQUFqQztFQUNBLE9BQU81RCxNQUFNLENBQUMsQ0FBRCxDQUFiO0FBQ0gsRUFHRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQSxJOzs7Ozs7Ozs7Ozs7QUN4SUEsaUVBQWUscUJBQXVCLGlEQUFpRCxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvQmFja2VuZE5vdGlmaWVyLnRzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL1RhZ0JveC9UYWdCb3gudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovLy8uL3NyYy9UYWdCb3hJbmplY3Rvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9UYWdBZGRCdXR0b24vVGFnQWRkQnV0dG9uLnNjc3MiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGFnRGF0YSB9IGZyb20gJy4vVGFnQm94L1RhZ0JveCdcclxuXHJcbmV4cG9ydCBjbGFzcyBCYWNrZW5kTm90aWZpZXIge1xyXG4gICAgLy9zdGF0aWMgdGFnc1Jlc291cmNlOiBzdHJpbmcgPSBcImh0dHBzOi8vc29uZ3RhZ3NiYWNrZW5kLmhlcm9rdWFwcC5jb20vdGFncy9hamF5L1wiXHJcbiAgICAvLyBzdGF0aWMgYWpheVRhZ3NFbmRwb2ludDogc3RyaW5nID0gXCJodHRwOi8vMTI3LjAuMC4xOjgwMDAvdGFncy9hamF5L1wiXHJcbiAgICBzdGF0aWMgdGFnc0VuZHBvaW50OiBzdHJpbmcgPSBcImh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90YWdzXCJcclxuXHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHVwZGF0ZVRhZ3NGb3JTb25nKHVzZXJuYW1lOnN0cmluZywgaHJlZjogc3RyaW5nLCB0YWdzOiBNYXA8c3RyaW5nLCBUYWdEYXRhPikge1xyXG4gICAgICAgIGNvbnN0IGVzNm1hcHRvanNvbiA9IEpTT04uc3RyaW5naWZ5KE9iamVjdC5mcm9tRW50cmllcyh0YWdzLmVudHJpZXMoKSkpXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGZldGNoKEJhY2tlbmROb3RpZmllci50YWdzRW5kcG9pbnQrXCIvXCIrdXNlcm5hbWUrXCIvXCIraHJlZiwge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxyXG4gICAgICAgICAgICBtb2RlOiAnY29ycycgYXMgUmVxdWVzdE1vZGUsXHJcbiAgICAgICAgICAgIGJvZHk6IGVzNm1hcHRvanNvblxyXG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVzcG9uc2V0ZXh0ID0gcmVzcG9uc2UudGV4dCgpIFxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2V0ZXh0O1xyXG4gICAgICAgIH0pLmNhdGNoKGVycm9yID0+IGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKSkgfHwgJ3t9JztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0VGFncyh1c2VybmFtZTogc3RyaW5nLCBocmVmOnN0cmluZywgdXBsb2FkZXI6c3RyaW5nLCBzb25nbmFtZTpzdHJpbmcsIHBsYXlsaXN0TmFtZTpzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBnZXRUYWdzVXJsID0gYCR7QmFja2VuZE5vdGlmaWVyLnRhZ3NFbmRwb2ludH0vJHt1c2VybmFtZX0vJHtocmVmfS8/dXBsb2FkZXI9JHt1cGxvYWRlcn0mc29uZ25hbWU9JHtzb25nbmFtZX0mcGxheWxpc3ROYW1lPSR7cGxheWxpc3ROYW1lfWBcclxuICAgICAgICBsZXQgdGFnc1N0cmluZyA9IGF3YWl0IGZldGNoKGdldFRhZ3NVcmwsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxyXG4gICAgICAgICAgICBtb2RlOiAnY29ycycgYXMgUmVxdWVzdE1vZGUsXHJcbiAgICAgICAgICAgIC8vIERvbnQgcGFzcyBpbiBib2R5IGludG8gR0VUIHBhcmFtcywgc29tZSBmcmFtZXdva3JzIGRvbnQgcGxheSBuaWNlIHdpdGggaXRcclxuICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcclxuICAgICAgICAgICAgbGV0IHJlc3BvbnNldGV4dCA9IHJlc3BvbnNlLnRleHQoKSBcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNldGV4dFxyXG4gICAgICAgIH0pLmNhdGNoKGVycm9yID0+IGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKSkgfHwgJ3t9JztcclxuICAgICAgICByZXR1cm4gdGFnc1N0cmluZztcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBCYWNrZW5kTm90aWZpZXIgfSBmcm9tICcuLi9CYWNrZW5kTm90aWZpZXInO1xuXG5cbmV4cG9ydCBjbGFzcyBUYWdEYXRhIHtcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgZGF0ZTogc3RyaW5nO1xuICAgIHBvc2l0aW9uOiBudW1iZXI7XG4gICAgY29uc3RydWN0b3IgKHR5cGU6IHN0cmluZyA9IFwiZGVmYXVsdFwiLCBkYXRlOiBzdHJpbmcgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpIHtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5kYXRlID0gZGF0ZTtcbiAgICAgICAgaWYodHlwZSA9PSBcImFydGlzdFwiKSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gNTA7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcInVwbG9hZGVyXCIpIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSAxMDA7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlZmF1bHRcIikge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IDk5OTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSAxNTA7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUYWdCb3gge1xuICAgIHBsYXlsaXN0TmFtZTogc3RyaW5nO1xuICAgIGhyZWY6IHN0cmluZztcblxuICAgIGRpdkVsOiBFbGVtZW50O1xuICAgIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50O1xuXG4gICAgbWF4VGFnczogbnVtYmVyO1xuICAgIHRhZ3M6IE1hcDxzdHJpbmcsIFRhZ0RhdGE+O1xuXG5cbiAgICBjb25zdHJ1Y3RvcihocmVmOiBzdHJpbmcsIHVwbG9hZGVyOiBzdHJpbmcsIHNvbmduYW1lOiBzdHJpbmcsIHBsYXlsaXN0TmFtZTogc3RyaW5nKSB7XG4gICAgICAgIC8vIHRoaXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgLy8gbGV0IHRhZ0JveERpdjogRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuICAgICAgICB0aGlzLnBsYXlsaXN0TmFtZSA9IHBsYXlsaXN0TmFtZTtcbiAgICAgICAgdGhpcy5ocmVmID0gaHJlZjsgXG4gICAgICAgIHRoaXMudGFncyA9IG5ldyBNYXA8c3RyaW5nLCBUYWdEYXRhPigpO1xuICAgICAgICB0aGlzLm1heFRhZ3MgPSAxMCxcblxuICAgICAgICB0aGlzLmRpdkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJyk7XG4gICAgICAgIGlmKHBsYXlsaXN0TmFtZSA9PT0gXCJXYXRjaCBsYXRlclwiKSB7XG4gICAgICAgICAgICAvLyB0aGlzLnVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKSBhcyBIVE1MVUxpc3RFbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRpdkVsLmNsYXNzTGlzdC5hZGQoXCJ0YWdib3hcIik7XG4gICAgICAgICAgICB0aGlzLmRpdkVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0OiBhbnkpID0+IGV2dC5zdG9wUHJvcGFnYXRpb24oKSk7IC8vIE9yIGVsc2Ugd2UgdHJpZ2dlciB5b3V0dWJlcyBjbGljayBoYW5kbGVyIGFuZCBlbnRlciB0aGUgc29uZ1xuICAgICAgICAgICAgdGhpcy5kaXZFbC5pbm5lckhUTUwgPVxuICAgICAgICAgICAgYFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWlucHV0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiYCArIGhyZWYgKyBgXCIgcGxhY2Vob2xkZXI9XCJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImAgKyBocmVmICsgYFwiIGNsYXNzPXRhZ2xhYmVsPis8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYFxuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IHRoaXMuZGl2RWwucXVlcnlTZWxlY3RvcihcImlucHV0XCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXG4gICAgICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCB0aGlzLmFkZFRhZ0Zyb21Vc2VyLmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAvLyBMZXQgYmFja2VuZCBkbyBhbGwgdGhlIHdvcmsgb2YgZ2V0dGluZyB0YWdzIVxuICAgICAgICAgICAgQmFja2VuZE5vdGlmaWVyLmdldFRhZ3MoXCJhamF5XCIsIHRoaXMuaHJlZiwgdXBsb2FkZXIsIHNvbmduYW1lLCBwbGF5bGlzdE5hbWUpLnRoZW4odGFnc1N0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHRhZ3M6IE1hcDxzdHJpbmcsIFRhZ0RhdGE+ID0gbmV3IE1hcChPYmplY3QuZW50cmllcyhKU09OLnBhcnNlKHRhZ3NTdHJpbmcpKSk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICB0aGlzLnJlYnVpbGRUYWdzKCk7ICAgICAgICAgICAgIC8vIG5lZWRlZCBmb3IgZmlyc3QgcnVudGhyb3VnaFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdlIHVzZSB0aGlzIG1hcCB0byBlbmFibGUgYnVsayB1cGRhdGVzIGluc3RlYWQgb2Ygb25lIGJ5IG9uZSB3aGVuZXZlciBhIGNoYW5nZSBvY2N1cnNcbiAgICAvLyBhZGRUYWdzKGF1dG9tYXRlZFRhZ3M6IE1hcDxzdHJpbmcsIFRhZ0RhdGE+LCBiYWNrZW5kVGFnczpNYXA8c3RyaW5nLCBUYWdEYXRhPikge1xuICAgIGFkZFRhZ3ModGFnczogTWFwPHN0cmluZywgVGFnRGF0YT4pIHtcbiAgICAgICAgbGV0IGlzTmV3VGFnID0gZmFsc2U7XG4gICAgICAgIHRhZ3MuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgaXNOZXdUYWcgPSB0aGlzLmFkZFRhZ1RvTG9jYWwoa2V5LCB2YWx1ZS50eXBlKTtcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIGlmKGlzTmV3VGFnKSB7IFxuICAgICAgICAgICAgQmFja2VuZE5vdGlmaWVyLnVwZGF0ZVRhZ3NGb3JTb25nKFwiYWpheVwiLCB0aGlzLmhyZWYsIHRoaXMudGFncyk7IFxuICAgICAgICAgICAgdGhpcy5yZWJ1aWxkVGFncygpOyAgIFxuICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGRvIHRoaXMgZm9yIGZpcnN0IHRpbWUgb25seSB0byBjcmVhdGUgdGFncyBvbiBmcm9udGVuZFxuICAgIH1cblxuICAgIGFkZFRhZ1RvTG9jYWwodGFnTmFtZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcgPSBcImRlZmF1bHRcIik6IGJvb2xlYW4ge1xuICAgICAgICAvLyBDYW4gaGF2ZSB1cCB0byAxMCB0YWdzLiBObyBkdXBsaWNhdGVzLiBNaW5pbXVtIGxlbmd0aCA9IDFcbiAgICAgICAgbGV0IGlzTmV3VGFnID0gZmFsc2U7XG4gICAgICAgIGlmKCF0aGlzLnRhZ3MuaGFzKHRhZ05hbWUpKXtcbiAgICAgICAgICAgIGlzTmV3VGFnID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKHRoaXMudGFncy5zaXplID49IDEwKSByZXR1cm4gZmFsc2U7IFxuICAgICAgICAgICAgdGhpcy50YWdzLnNldCh0YWdOYW1lLCBuZXcgVGFnRGF0YSh0eXBlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzTmV3VGFnO1xuICAgIH1cblxuICAgIC8vIFJlYWRzIGlucHV0IGZpZWxkIGFuZCBhZGRzIHRoZSB0YWdcbiAgICBhZGRUYWdGcm9tVXNlcihlOktleWJvYXJkRXZlbnQpe1xuICAgICAgICBpZiAoZS5rZXkgIT09ICdFbnRlcicpIHJldHVybjtcbiAgICAgICAgbGV0IGlucHV0RWwgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICBsZXQgdGFnTmFtZSA9IGlucHV0RWwudmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuXG4gICAgICAgIHRoaXMuYWRkVGFncyhuZXcgTWFwPHN0cmluZywgVGFnRGF0YT4oW1t0YWdOYW1lLCBuZXcgVGFnRGF0YShcImRlZmF1bHRcIildXSkpO1xuICAgICAgICBpbnB1dEVsLnZhbHVlID0gXCJcIjtcbiAgICB9XG5cbiAgICByZW1vdmVUYWcoZXZ0Ok1vdXNlRXZlbnQsIHRhZ05hbWU6IHN0cmluZyl7XG4gICAgICAgIGxldCBlbGVtZW50ID0gZXZ0LnRhcmdldCBhcyBFbGVtZW50O1xuICAgICAgICBjb25zb2xlLmxvZygnUmVtb3ZpbmcgdGFnIGVsZW1lbnQ6JywgZWxlbWVudCk7XG4gICAgICAgIGlmKCFlbGVtZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMudGFncy5kZWxldGUodGFnTmFtZSlcbiAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgQmFja2VuZE5vdGlmaWVyLnVwZGF0ZVRhZ3NGb3JTb25nKFwiYWpheVwiLCB0aGlzLmhyZWYsIHRoaXMudGFncyk7XG4gICAgfVxuXG4gICAgLy8gUmVidWlsZHMgdGhlIHRhZyBib3ggY29udGVudHMgZm9yIHRoZSBhc3NvY2lhdGVkIGhyZWZcbiAgICByZWJ1aWxkVGFncygpe1xuICAgICAgICB0aGlzLmRpdkVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJhXCIpLmZvckVhY2gobGkgPT4gbGkucmVtb3ZlKCkpO1xuICAgICAgICB0aGlzLnRhZ3MuZm9yRWFjaCgodGFnLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGxldCBhbmNob3JUYWc6IEhUTUxBbmNob3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgYW5jaG9yVGFnLmhyZWYgPSBcImphdmFzY3JpcHQ6O1wiO1xuICAgICAgICAgICAgYW5jaG9yVGFnLmNsYXNzTGlzdC5hZGQoXCJwaWxsXCIpO1xuICAgICAgICAgICAgYW5jaG9yVGFnLmNsYXNzTGlzdC5hZGQodGFnLnR5cGUpOyAvLyB3aWxsIGJlIHVzZWQgdG8gZ2l2ZSBkaWZmZXJlbnQgY29sb3IgdG8gdGFnc1xuICAgICAgICAgICAgYW5jaG9yVGFnLmlubmVySFRNTCA9IGBcXCMke2tleX0gYFxuICAgICAgICAgICAgbGV0IHJlbW92ZVRhZ0JvdW5kID0gdGhpcy5yZW1vdmVUYWcuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIGFuY2hvclRhZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldnQpID0+IHJlbW92ZVRhZ0JvdW5kKGV2dCxrZXkpKTtcbiAgICAgICAgICAgIHRoaXMuZGl2RWwuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYWZ0ZXJiZWdpblwiLCBhbmNob3JUYWcpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIHBhcnNlRGF0YShzb25nbmFtZTogc3RyaW5nLCB1cGxvYWRlcjogc3RyaW5nLCBwbGF5bGlzdE5hbWU6IHN0cmluZykge1xuICAgICAgICBsZXQgdGFnc1RvQWRkID0gbmV3IE1hcDxzdHJpbmcsIFRhZ0RhdGE+KCk7XG4gICAgICAgIGxldCBhcnRpc3RGb3VuZDogYm9vbGVhbiA9IGZhbHNlOyBcbiAgICAgICAgXG5cbiAgICAgICAgLyogVm9jYWxvaWQgKi9cbiAgICAgICAgLy8gY29uc3QgbWlrdVJlZ2V4ID0gbmV3IFJlZ0V4cCgnTWlrdXzjg5/jgq8nLCAnaScpXG4gICAgICAgIC8vIGlmIChtaWt1UmVnZXgudGVzdChzb25nbmFtZSkpIHRhZ3NUb0FkZC5zZXQoXCLjg5/jgq9cIiwgbmV3IFRhZ0RhdGEoXCJ2b2NhbG9pZFwiKSk7XG5cbiAgICAgICAgLy8gLyogR2FtZSBhbmQgQW5pbWUgKi9cbiAgICAgICAgLy8gY29uc3QgZ2FtZVJlZ2V4ID0gbmV3IFJlZ0V4cCgnKEJsdWUgQXJjaGl2ZXxDb3VudGVyc2lkZXxMb3N0IEFya3xBcmtuaWdodHMpJywgJ2knKVxuICAgICAgICAvLyBjb25zdCBnYW1lTWF0Y2ggPSBzb25nbmFtZS5tYXRjaChnYW1lUmVnZXgpXG4gICAgICAgIC8vIGlmIChnYW1lTWF0Y2gpIHt0YWdzVG9BZGQuc2V0KGdhbWVNYXRjaFsxXS50cmltKCksIG5ldyBUYWdEYXRhKFwiZ2FtZVwiKSk7IGFydGlzdEZvdW5kID0gdHJ1ZTt9XG4gIFxuICAgICAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAgKiAgICAgIFJlZ2V4IHRvIHBhcnNlIHVwbG9hZGVyIG5hbWUgKGFuZCB0cnkgdG8gZmluZCBhcnRpc3QpICAgICAgKlxuICAgICAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8gIFxuICAgICAgICAvLyBDYXNlIDAgLSBBcnRpc3QgYWxyZWFkeSBmb3VpbmQgXG4gICAgICAgICBpZihhcnRpc3RGb3VuZCkgcmV0dXJuIHRhZ3NUb0FkZDsgXG5cblxuICAgICAgICAvLyBDYXNlIDMgLSBGb3VuZCBhcnRpc3QgYnkgcmVtb3ZpbmcgXFxcbiAgICAgICAgY29uc3Qgc2xhc2hSZWdleCA9IG5ldyBSZWdFeHAoJyguKj8pIFxcLycpXG4gICAgICAgIHZhciByZXN1bHQ6IFJlZ0V4cE1hdGNoQXJyYXkgPSB1cGxvYWRlci5tYXRjaChzbGFzaFJlZ2V4KSBhcyBSZWdFeHBNYXRjaEFycmF5O1xuICAgICAgICBpZihyZXN1bHQpIHtcbiAgICAgICAgICAgIHRhZ3NUb0FkZC5zZXQocmVzdWx0WzFdLCBuZXcgVGFnRGF0YShcImFydGlzdFwiKSlcbiAgICAgICAgICAgIHJldHVybiB0YWdzVG9BZGQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYXNlIDUgLSBGb3VuZCBhcnRpc3QgdGhhdCBoYXMg44G+44G144G+44G144Gh44KD44KT44Gt44KLXG4gICAgICAgIGNvbnN0IOOBoeOCg+OCk+OBreOCi0luVXBsb2FkZXJOYW1lUmVnZXggPSBuZXcgUmVnRXhwKCcoLio/KeOBoeOCg+OCk+OBreOCiycsICdpJylcbiAgICAgICAgdmFyIHJlc3VsdDogUmVnRXhwTWF0Y2hBcnJheSA9IHVwbG9hZGVyLm1hdGNoKOOBoeOCg+OCk+OBreOCi0luVXBsb2FkZXJOYW1lUmVnZXgpIGFzIFJlZ0V4cE1hdGNoQXJyYXk7XG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgIHRhZ3NUb0FkZC5zZXQocmVzdWx0WzFdLCBuZXcgVGFnRGF0YShcImFydGlzdFwiKSk7XG4gICAgICAgICAgICByZXR1cm4gdGFnc1RvQWRkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FzZSA5OTggLSBEZWxpbWl0IG9uICctJyBsbWFvLi5cbiAgICAgICAgY29uc3QgZGFzaFJlZ2V4ID0gbmV3IFJlZ0V4cCgnKC4qPykgLS4qJylcbiAgICAgICAgdmFyIHJlc3VsdDogUmVnRXhwTWF0Y2hBcnJheSA9IHNvbmduYW1lLm1hdGNoKGRhc2hSZWdleCkgYXMgUmVnRXhwTWF0Y2hBcnJheTtcbiAgICAgICAgaWYocmVzdWx0KSB7XG4gICAgICAgICAgICB0YWdzVG9BZGQuc2V0KHJlc3VsdFsxXSwgbmV3IFRhZ0RhdGEoXCJhcnRpc3RcIikpXG4gICAgICAgICAgICByZXR1cm4gdGFnc1RvQWRkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FzZSA5OTkgLSBSZXR1cm4gdXBsb2FkZXIgb25seS4uIGFydGlzdCBub3QgZm91bmRcbiAgICAgICAgdGFnc1RvQWRkLnNldCh1cGxvYWRlciwgbmV3IFRhZ0RhdGEoXCJ1cGxvYWRlclwiKSk7XG4gICAgICAgIHJldHVybiB0YWdzVG9BZGQ7XG4gICAgfVxuXG5cblxuXG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiaW1wb3J0IHsgVGFnQm94IH0gZnJvbSAnLi9jb21wb25lbnRzL1RhZ0JveC9UYWdCb3gnO1xuXG5jb25zdCBkZWxheSA9ICh0Om51bWJlcikgPT4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIHQpKTtcblxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcbiAgICBjb25zdCBjdXJyZW50VXJsOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICBjb25zdCBwbGF5bGlzdFJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKCd5b3V0dWJlXFwuY29tXFwvcGxheWxpc3RcXFxcP2xpc3Q9JywgJ2knKVxuICAgIGlmIChwbGF5bGlzdFJlZ2V4LnRlc3QoY3VycmVudFVybCkpIGluamVjdFRhZ0JveFRvUGxheWxpc3RJdGVtcygpO1xuICAgIGNvbnN0IHBsYXlsaXN0U29uZ1JlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKCd5b3V0dWJlLmNvbS93YXRjaFxcXFw/dj0oLiopXFwmbGlzdD0nLCAnaScpXG4gICAgaWYgKHBsYXlsaXN0U29uZ1JlZ2V4LnRlc3QoY3VycmVudFVybCkpIHdhaXRGb3JZb3V0dWJlKCk7XG59XG5cbmZ1bmN0aW9uIGluamVjdFRhZ0JveFRvU29uZygpIHtcbiAgICAvLyBwcmltYXJ5RWwucXVlcnlTZWxlY3RvcihcImRpdi53YXRjaC1hY3RpdmUtbWV0YWRhdGEgZGl2Om50aC1jaGlsZCgyKVwiKVxuICAgIHZhciBwbGF5bGlzdE5hbWVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2gzIHl0LWZvcm1hdHRlZC1zdHJpbmcgYVtocmVmXj1cIi9wbGF5bGlzdFwiXScpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuICAgIHZhciBjaGFubmVsTmFtZUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigneXQtZm9ybWF0dGVkLXN0cmluZ1tjbGFzcyo9XCJ5dGQtY2hhbm5lbC1uYW1lXCJdIGEnKSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcbiAgICB2YXIgc29uZ05hbWVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXZbaWQ9XFxcImNvbnRhaW5lclxcXCJdIGgxIHl0LWZvcm1hdHRlZC1zdHJpbmdcIikgYXMgSFRNTEVsZW1lbnRcblxuICAgIGNvbnNvbGUubG9nKGBQbGF5bGlzdCBOYW1lOiAke3BsYXlsaXN0TmFtZUVsLmlubmVyVGV4dH0gXFxuQ2hhbm5lbCBOYW1lOiAke2NoYW5uZWxOYW1lRWwuaW5uZXJUZXh0fSBcXG5Tb25nIE5hbWU6ICR7c29uZ05hbWVFbC5pbm5lclRleHR9YCk7XG5cbiAgICBjb25zdCBiZWxvd1RoZVBsYXllckVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdltpZD1cXFwiYWJvdmUtdGhlLWZvbGRcXFwiXVwiKSBhcyBIVE1MRGl2RWxlbWVudDtcblxuICAgIGNvbnN0IHRhZ0JveEVsID0gbmV3IFRhZ0JveChwYXJzZUhyZWYod2luZG93LmxvY2F0aW9uLmhyZWYpLCBjaGFubmVsTmFtZUVsLmlubmVyVGV4dCwgc29uZ05hbWVFbC5pbm5lclRleHQsIHBsYXlsaXN0TmFtZUVsLmlubmVyVGV4dClcblxuICAgIGJlbG93VGhlUGxheWVyRWwuaW5zZXJ0QmVmb3JlKHRhZ0JveEVsLmRpdkVsLCBiZWxvd1RoZVBsYXllckVsLmZpcnN0Q2hpbGQpO1xuICAgIGNvbnNvbGUubG9nKFwiQWRkZWQgdGFnYm94IHRvIGN1cnJlbnRseSBwbGF5aW5nIHNvbmdcIiwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcblxufVxuXG5mdW5jdGlvbiBpbmplY3RUYWdCb3hUb1BsYXlsaXN0SXRlbXMoKSB7XG4gICAgLy8gVHJhdmVyc2luZyB0aGUgQWN0dWFsIFNvbmcgUGFuZXNcbiAgICBjb25zdCBkaXNwbGF5RGlhbG9nRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjZGlzcGxheS1kaWFsb2cnKVswXSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAvLyBjb25zb2xlLmxvZyhwbGF5bGlzdE5hbWVFbCk7XG4gICAgLy8gY29uc29sZS5sb2cocGxheWxpc3ROYW1lRWwuaW5uZXJUZXh0KTtcbiAgICBjb25zdCBzb25nUGFuZXM6IE5vZGVMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdiB5dGQtcGxheWxpc3QtdmlkZW8tcmVuZGVyZXJcIik7IFxuICAgIHNvbmdQYW5lcy5mb3JFYWNoKChzb25nUGFuZSkgPT4ge1xuICAgICAgICBsZXQgc29uZ1BhbmVFbCA9IHNvbmdQYW5lIGFzIEVsZW1lbnQ7XG5cbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZGl2IHRoYXQgcmVwcmVzZW50cyB0aGUgd2hvbGUgcm93XG4gICAgICAgIGNvbnN0IGNvbnRlbnRFbCA9IHNvbmdQYW5lRWwuY2hpbGRyZW5bMV0gYXMgSFRNTERpdkVsZW1lbnQ7XG5cbiAgICAgICAgLy8gVGhpcyBpcyB5b3V0dWJlcyBjb250YWluZXIgZWxlbWVudCBpbmNsdWRpbmcgd2hpY2ggY29udGFpbnMgdGhlIHRodW1ibmFpbCBhbmQgbWV0YWRhdGFcbiAgICAgICAgY29uc3QgY29udGFpbmVyRWwgPSBjb250ZW50RWwuY2hpbGRyZW5bMF0gYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgIGNvbnRhaW5lckVsLnN0eWxlLmFsaWduSXRlbXMgPSAnY2VudGVyJztcbiAgICAgICAgY29udGVudEVsLnN0eWxlLmZsZXhXcmFwID0gJ25vd3JhcCdcblxuICAgICAgICAvLyBXaXRoaW4gdGhlIHRodW1ibmFpbCB3ZSBjYW4gZ2V0IHRoZSBocmVmXG4gICAgICAgIGNvbnN0IHRodW1ibmFpbEVsID0gY29udGFpbmVyRWwuY2hpbGRyZW5bMF0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGFuY2hvckVsID0gdGh1bWJuYWlsRWwuY2hpbGRyZW5bMF0gYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG5cbiAgICAgICAgLy8gV2l0aGluIHRoZSBtZXRhZGF0YSB3ZSBjYW4gZ2V0IHRoZSBzb25nIHRpdGxlLCBhdXRob3JcbiAgICAgICAgY29uc3QgbWV0YUVsID0gY29udGFpbmVyRWwuY2hpbGRyZW5bMV07XG4gICAgICAgIGNvbnN0IG1ldGFEYXRhRWwgPSBtZXRhRWwuY2hpbGRyZW5bMV0uY2hpbGRyZW5bMF0gYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGNoYW5uZWxOYW1lQ29udGFpbmVyRWwgPSBtZXRhRGF0YUVsLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzBdIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBjaGFubmVsTmFtZUVsID0gY2hhbm5lbE5hbWVDb250YWluZXJFbC5jaGlsZHJlblswXS5jaGlsZHJlblswXS5jaGlsZHJlblswXSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcblxuICAgICAgICBjb25zdCBzb25nTmFtZUVsID0gbWV0YUVsLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzFdIGFzIEhUTUxBbmNob3JFbGVtZW50XG4gICAgICAgIGNvbnN0IHBsYXlsaXN0TmFtZUVsID0gZGlzcGxheURpYWxvZ0VsLmNoaWxkcmVuWzFdIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHRhZ0JveEVsID0gbmV3IFRhZ0JveChwYXJzZUhyZWYoYW5jaG9yRWwuaHJlZiksIGNoYW5uZWxOYW1lRWwuaW5uZXJUZXh0LCBzb25nTmFtZUVsLmlubmVyVGV4dCwgcGxheWxpc3ROYW1lRWwuaW5uZXJUZXh0KVxuICAgICAgICBjb25zb2xlLmxvZygnVGhpcyBzb25ncyBwYXJzZWQgdXJsIGlzOiAnLCBwYXJzZUhyZWYoYW5jaG9yRWwuaHJlZikpO1xuICAgICAgICBjb250ZW50RWwuYXBwZW5kQ2hpbGQodGFnQm94RWwuZGl2RWwpO1xuICAgIH0pXG59XG5cbmNvbnN0IHdhaXRGb3JZb3V0dWJlID0gYXN5bmMgKHJvb3RFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSA9PiB7XG4gICAgbGV0IHNlbGVjdG9yOmFueSA9ICdhYm92ZS10aGUtZm9sZCdcbiAgICBjb25zb2xlLmxvZyhgV2FpdGluZyBmb3IgJHtzZWxlY3Rvcn0uLi5gLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xuICAgIGxldCBjb25maWcgPSB7XG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICB9XG4gICAgLy8gRmlyc3QsIGRvIHN0dWZmIHdoZW4gZWxlbWVudCBzcGF3bnNcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtzZWxlY3Rvcn0gd2FzIGZvdW5kIWAsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgaW5qZWN0VGFnQm94VG9Tb25nKCk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZWxlbWVudCBhcyBIVE1MRGl2RWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHJvb3RFbGVtZW50LCBjb25maWcpO1xuICAgIH0pLnRoZW4oZWxlbWVudCA9PiB7XG4gICAgLy8gU2Vjb25kLCBkbyBzdHVmZiB3aGVuZXZlciB0aGF0IGVsZW1lbnQgY2hhbmdlc1xuICAgICAgICBzZWxlY3RvciA9ICdkaXYjYWJvdmUtdGhlLWZvbGQgZGl2I3RpdGxlIGgxJyAvLyBlbGVtZW50IHRoYXQgaG9sZHMgdGl0bGVcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb25DaGFuZ2VkID0gZnVuY3Rpb24gKG11dGF0aW9uc0xpc3Q6YW55LCBvYnNlcnZlcjphbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG11dGF0aW9uc0xpc3QpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENoYW5nZXMgZGV0ZWN0ZWQgaW4gJHtzZWxlY3Rvcn1gLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICAgICAgZGVsZXRlVGFnQm94ZXMoKTtcbiAgICAgICAgICAgIGluamVjdFRhZ0JveFRvU29uZygpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZGVzY3JpcHRpb25DaGFuZ2VkKVxuICAgICAgICBkZXNjcmlwdGlvbk9ic2VydmVyLm9ic2VydmUoKGVsZW1lbnQgYXMgSFRNTERpdkVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLCBjb25maWcpXG4gICAgfSlcbn07XG5cblxuXG5cbmZ1bmN0aW9uIGRlbGV0ZVRhZ0JveGVzKCkge1xuICAgIGNvbnN0IHRhZ0JveFdyYXBwZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRhZ2JveCcpIGFzIE5vZGVMaXN0T2Y8RWxlbWVudD47XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHRhZ0JveFdyYXBwZXJzKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIHBhcnNlSHJlZihocmVmOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZWdleHA6IFJlZ0V4cCA9IC93YXRjaFxcP3Y9KC4qPylcXCYvaTtcbiAgICBjb25zdCByZXN1bHQ6IFJlZ0V4cE1hdGNoQXJyYXkgPSBocmVmLm1hdGNoKHJlZ2V4cCkgYXMgUmVnRXhwTWF0Y2hBcnJheTtcbiAgICByZXR1cm4gcmVzdWx0WzFdO1xufVxuXG5cbi8vIGZ1bmN0aW9uIHN0YXJ0SHJlZk9ic2VydmVyKGN1cnJlbnRocmVmOiBzdHJpbmcpIHtcbi8vICAgICB2YXIgYm9keUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKSBhcyBIVE1MQm9keUVsZW1lbnQ7XG4vLyAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24obXV0YXRpb25zKSB7XG4vLyAgICAgICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG11dGF0aW9uKSB7XG4vLyAgICAgICAgICAgICBpZiAoY3VycmVudGhyZWYgIT0gd2luZG93LmxvY2F0aW9uLmhyZWYpIHtcbi8vICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk9ic2VydmVyIGRldGVjdGVkIGhyZWYgY2hhbmdlXCIsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XG4vLyAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDdXJyZW50OiBcIiArIGN1cnJlbnRocmVmLCBcIk9sZDogXCIgKyB3aW5kb3cubG9jYXRpb24uaHJlZik7XG4vLyAgICAgICAgICAgICAgICAgY3VycmVudGhyZWYgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbi8vICAgICAgICAgICAgICAgICBkZWxldGVUYWdCb3hlcygpO1xuLy8gICAgICAgICAgICAgICAgIGluaXRpYWxpemVUYWdCb3hlcygpO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9KTtcbi8vICAgICB9KTtcbiAgICBcbi8vICAgICB2YXIgY29uZmlnID0ge1xuLy8gICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4vLyAgICAgICAgIHN1YnRyZWU6IHRydWVcbi8vICAgICB9O1xuICAgIFxuLy8gICAgIG9ic2VydmVyLm9ic2VydmUoYm9keUxpc3QsIGNvbmZpZyk7XG4vLyB9XG5cblxuXG5cbiIsImV4cG9ydCBkZWZhdWx0IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJzcmMvY29tcG9uZW50cy9UYWdBZGRCdXR0b24vVGFnQWRkQnV0dG9uLmNzc1wiOyJdLCJuYW1lcyI6WyJCYWNrZW5kTm90aWZpZXIiLCJ0YWdzRW5kcG9pbnQiLCJ1cGRhdGVUYWdzRm9yU29uZyIsInVzZXJuYW1lIiwiaHJlZiIsInRhZ3MiLCJlczZtYXB0b2pzb24iLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0IiwiZnJvbUVudHJpZXMiLCJlbnRyaWVzIiwiZmV0Y2giLCJtZXRob2QiLCJyZWRpcmVjdCIsIm1vZGUiLCJib2R5IiwidGhlbiIsInJlc3BvbnNlIiwicmVzcG9uc2V0ZXh0IiwidGV4dCIsImNhdGNoIiwiZXJyb3IiLCJjb25zb2xlIiwibG9nIiwiZ2V0VGFncyIsInVwbG9hZGVyIiwic29uZ25hbWUiLCJwbGF5bGlzdE5hbWUiLCJnZXRUYWdzVXJsIiwidGFnc1N0cmluZyIsIlRhZ0RhdGEiLCJjb25zdHJ1Y3RvciIsInR5cGUiLCJkYXRlIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwicG9zaXRpb24iLCJUYWdCb3giLCJNYXAiLCJtYXhUYWdzIiwiZGl2RWwiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpbnB1dCIsImNsYXNzTGlzdCIsImFkZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldnQiLCJzdG9wUHJvcGFnYXRpb24iLCJpbm5lckhUTUwiLCJxdWVyeVNlbGVjdG9yIiwiYWRkVGFnRnJvbVVzZXIiLCJiaW5kIiwicGFyc2UiLCJyZWJ1aWxkVGFncyIsImFkZFRhZ3MiLCJpc05ld1RhZyIsImZvckVhY2giLCJ2YWx1ZSIsImtleSIsImFkZFRhZ1RvTG9jYWwiLCJ0YWdOYW1lIiwiaGFzIiwic2l6ZSIsInNldCIsImUiLCJpbnB1dEVsIiwidGFyZ2V0IiwicmVwbGFjZSIsInJlbW92ZVRhZyIsImVsZW1lbnQiLCJkZWxldGUiLCJyZW1vdmUiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGkiLCJ0YWciLCJhbmNob3JUYWciLCJyZW1vdmVUYWdCb3VuZCIsImluc2VydEFkamFjZW50RWxlbWVudCIsInBhcnNlRGF0YSIsInRhZ3NUb0FkZCIsImFydGlzdEZvdW5kIiwic2xhc2hSZWdleCIsIlJlZ0V4cCIsInJlc3VsdCIsIm1hdGNoIiwi44Gh44KD44KT44Gt44KLSW5VcGxvYWRlck5hbWVSZWdleCIsImRhc2hSZWdleCIsImRlbGF5IiwidCIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsIndpbmRvdyIsIm9ubG9hZCIsImN1cnJlbnRVcmwiLCJsb2NhdGlvbiIsInBsYXlsaXN0UmVnZXgiLCJ0ZXN0IiwiaW5qZWN0VGFnQm94VG9QbGF5bGlzdEl0ZW1zIiwicGxheWxpc3RTb25nUmVnZXgiLCJ3YWl0Rm9yWW91dHViZSIsImluamVjdFRhZ0JveFRvU29uZyIsInBsYXlsaXN0TmFtZUVsIiwiY2hhbm5lbE5hbWVFbCIsInNvbmdOYW1lRWwiLCJpbm5lclRleHQiLCJiZWxvd1RoZVBsYXllckVsIiwidGFnQm94RWwiLCJwYXJzZUhyZWYiLCJpbnNlcnRCZWZvcmUiLCJmaXJzdENoaWxkIiwiZGlzcGxheURpYWxvZ0VsIiwic29uZ1BhbmVzIiwic29uZ1BhbmUiLCJzb25nUGFuZUVsIiwiY29udGVudEVsIiwiY2hpbGRyZW4iLCJjb250YWluZXJFbCIsInN0eWxlIiwiYWxpZ25JdGVtcyIsImZsZXhXcmFwIiwidGh1bWJuYWlsRWwiLCJhbmNob3JFbCIsIm1ldGFFbCIsIm1ldGFEYXRhRWwiLCJjaGFubmVsTmFtZUNvbnRhaW5lckVsIiwiYXBwZW5kQ2hpbGQiLCJyb290RWxlbWVudCIsImRvY3VtZW50RWxlbWVudCIsInNlbGVjdG9yIiwiY29uZmlnIiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsImdldEVsZW1lbnRCeUlkIiwiZGlzY29ubmVjdCIsIm9ic2VydmUiLCJkZXNjcmlwdGlvbkNoYW5nZWQiLCJtdXRhdGlvbnNMaXN0IiwiZGVsZXRlVGFnQm94ZXMiLCJkZXNjcmlwdGlvbk9ic2VydmVyIiwidGFnQm94V3JhcHBlcnMiLCJyZWdleHAiXSwic291cmNlUm9vdCI6IiJ9