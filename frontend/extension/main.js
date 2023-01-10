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

} // export class Tag2 {
//     name: string;
//     type: string;
//     date: string;
//     constructor (name: string, type: string = "default", date: string = new Date().toISOString()) {
//         this.name = name;
//         this.type = type;
//         this.date = date;
//     }
// }

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
    /*******************************************************************
     *                 Regex to parse playlist name                    *
     *******************************************************************/

    const OSTPlaylistRegex = new RegExp('Game/TV/Movie OST');
    if (OSTPlaylistRegex.test(playlistName)) tagsToAdd.set("OST", new TagData("category"));
    const classicsPlaylistRegex = new RegExp('^Classics$');
    if (classicsPlaylistRegex.test(playlistName)) tagsToAdd.set("ᛄᛄᛄᛄᛄ", new TagData("GOAT"));
    tagsToAdd.set("INPLAYLIST", new TagData("metadata"));
    /*******************************************************************
     *       Regex to parse song name and get extra information        *
     *******************************************************************/

    /* Regex to parse song name and get extra information*/

    const nightcoreRegex = new RegExp('nightcore', 'i');
    if (nightcoreRegex.test(songname)) tagsToAdd.set("Nightcore", new TagData("category"));
    const tanocRegex = new RegExp('usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\\+pazolite|RoughSketch|Kobaryo|P\\*Light|nora2r|Relect|Getty|Tatsunoshin', 'i');
    if (tanocRegex.test(songname)) tagsToAdd.set("TANO*C", new TagData("category"));
    const touhouRegex = new RegExp('東方|Touhou', 'i');
    if (touhouRegex.test(songname)) tagsToAdd.set("東方", new TagData("category"));
    /* Vocaloid */

    const mikuRegex = new RegExp('Miku|ミク', 'i');
    if (mikuRegex.test(songname)) tagsToAdd.set("ミク", new TagData("vocaloid"));
    const kafuRegex = new RegExp('Kafu|可不', 'i');
    if (kafuRegex.test(songname)) tagsToAdd.set("可不", new TagData("vocaloid"));
    const slaveRegex = new RegExp('Slave\.V-V-R', 'i');
    if (slaveRegex.test(songname)) tagsToAdd.set("Slave.V-V-R", new TagData("vocaloid"));
    const iaRegex = new RegExp(' IA');
    if (iaRegex.test(songname)) tagsToAdd.set("IA", new TagData("vocaloid"));
    /* Game and Anime */

    const gameRegex = new RegExp('(Blue Archive|Counterside|Lost Ark|Arknights)', 'i');
    const gameMatch = songname.match(gameRegex);

    if (gameMatch) {
      tagsToAdd.set(gameMatch[1].trim(), new TagData("game"));
      artistFound = true;
    }

    const persona5Regex = new RegExp('(P5|P5R|Persona 5)');
    const persona5Match = songname.match(persona5Regex);

    if (persona5Match) {
      tagsToAdd.set("Persona 5", new TagData("game"));
      artistFound = true;
    }

    const persona4Regex = new RegExp('(P4|P4G|Persona 4)');
    const persona4Match = songname.match(persona4Regex);

    if (persona4Match) {
      tagsToAdd.set("Persona 4", new TagData("game"));
      artistFound = true;
    }

    const danganronpaRegex = new RegExp('(Danganronpa|Danganronpa 2|SDR2|Danganronpa V3|Danganronpa 3)');
    const danganronpaMatch = songname.match(danganronpaRegex);

    if (danganronpaMatch) {
      tagsToAdd.set("Danganronpa", new TagData("game"));
      artistFound = true;
    }

    const honkaiRegex = new RegExp('(HI3|Honkai Impact 3|Houkai Impact 3)');
    const honkaiMatch = songname.match(honkaiRegex);

    if (honkaiMatch) {
      tagsToAdd.set("Honkai Impact 3rd", new TagData("game"));
      artistFound = true;
    }

    const animeRegex = new RegExp('(Bleach|Gintama|Link Click)', 'i');
    const animeMatch = songname.match(animeRegex);

    if (animeMatch) {
      tagsToAdd.set(animeMatch[1].trim(), new TagData("anime"));
      artistFound = true;
    }
    /*******************************************************************
     *      Regex to parse uploader name (and try to find artist)      *
     *******************************************************************/
    // Case 0 - Artist already fouind 


    if (artistFound) return tagsToAdd; // Case 1 - Found artist through topic

    const topicRegex = new RegExp(' - Topic', 'i');

    if (topicRegex.test(uploader)) {
      tagsToAdd.set(uploader.slice(0, -8), new TagData("artist"));
      return tagsToAdd;
    } // Case 2 - Found artist by removing Official


    const officialRegex = new RegExp('(.*?) Official', 'i');
    result = uploader.match(officialRegex);

    if (result) {
      tagsToAdd.set(result[1], new TagData("artist"));
      return tagsToAdd;
    } // Case 3 - Found artist by removing \


    const slashRegex = new RegExp('(.*?) \/');
    var result = uploader.match(slashRegex);

    if (result) {
      tagsToAdd.set(result[1], new TagData("artist"));
      return tagsToAdd;
    } // Case 4 - Found artist as uploader name  exists in song name 


    const uploaderInSongNameRegex = new RegExp(uploader, 'i');

    if (uploaderInSongNameRegex.test(songname)) {
      tagsToAdd.set(uploader, new TagData("artist"));
      return tagsToAdd;
    } // Case 5 - Found artist that has まふまふちゃんねる


    const ちゃんねるInUploaderNameRegex = new RegExp('(.*?)ちゃんねる', 'i');
    var result = uploader.match(ちゃんねるInUploaderNameRegex);

    if (result) {
      tagsToAdd.set(result[1], new TagData("artist"));
      return tagsToAdd;
    } // Case 6 - Found artist that has feat. in title
    // Case 997 - KMNZ x EXAMPLE is in title, uploader is KMNZ LITA
    // Case 499
    // Case 998 - Delimit on '-' lmao..


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
/*!****************************!*\
  !*** ./src/AddTagBoxes.ts ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_TagBox_TagBox__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/TagBox/TagBox */ "./src/components/TagBox/TagBox.ts");


const delay = t => new Promise(resolve => setTimeout(resolve, t));

window.onload = () => {
  const currentUrl = window.location.href;
  const playlistRegex = new RegExp('youtube\.com\/playlist\\?list=', 'i');
  if (playlistRegex.test(currentUrl)) addTagBoxesToPlaylistItems();
  const playlistSongRegex = new RegExp('youtube.com/watch\\?v=(.*)\&list=', 'i');
  if (playlistSongRegex.test(currentUrl)) waitForElement('above-the-fold');
};

const waitForElement = async (selector, rootElement = document.documentElement) => {
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
        addTagBoxesToSong();
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
      addTagBoxesToSong();
    };

    let descriptionObserver = new MutationObserver(descriptionChanged);
    descriptionObserver.observe(element.querySelector(selector), config);
  });
};

function addTagBoxesToSong() {
  // primaryEl.querySelector("div.watch-active-metadata div:nth-child(2)")
  var channelNameEl = document.querySelector('yt-formatted-string[class*="ytd-channel-name"] a');
  var songNameEl = document.querySelector("div[id=\"container\"] h1 yt-formatted-string");
  var playlistNameEl = document.querySelector('h3 yt-formatted-string a[href^="/playlist"]');
  console.log(playlistNameEl.innerText, channelNameEl.innerText, songNameEl.innerText);
  const belowThePlayerEl = document.querySelector("div[id=\"above-the-fold\"]");
  const tagBoxEl = new _components_TagBox_TagBox__WEBPACK_IMPORTED_MODULE_0__.TagBox(parseHref(window.location.href), channelNameEl.innerText, songNameEl.innerText, playlistNameEl.innerText);
  belowThePlayerEl.insertBefore(tagBoxEl.divEl, belowThePlayerEl.firstChild);
  console.log("Added tagbox to currently playing song", new Date().toISOString());
}

function addTagBoxesToPlaylistItems() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFHLElBQUloSCw2REFBSixDQUFXaUgsU0FBUyxDQUFDYyxRQUFRLENBQUNqSyxJQUFWLENBQXBCLEVBQXFDNkksYUFBYSxDQUFDRyxTQUFuRCxFQUE4REYsVUFBVSxDQUFDRSxTQUF6RSxFQUFvRkQsY0FBYyxDQUFDQyxTQUFuRyxDQUFqQjtJQUNBN0gsT0FBTyxDQUFDQyxHQUFSLENBQVksNEJBQVosRUFBMEMrSCxTQUFTLENBQUNjLFFBQVEsQ0FBQ2pLLElBQVYsQ0FBbkQ7SUFDQTBKLFNBQVMsQ0FBQ1csV0FBVixDQUFzQm5CLFFBQVEsQ0FBQzdHLEtBQS9CO0VBQ0gsQ0EzQkQ7QUE0Qkg7O0FBR0QsU0FBU3NHLGNBQVQsR0FBMEI7RUFDdEIsTUFBTTJCLGNBQWMsR0FBR2hJLFFBQVEsQ0FBQ2dDLGdCQUFULENBQTBCLFNBQTFCLENBQXZCOztFQUNBLEtBQUssTUFBTUgsT0FBWCxJQUFzQm1HLGNBQXRCLEVBQXNDO0lBQ2xDbkcsT0FBTyxDQUFDRSxNQUFSO0VBQ0g7QUFDSjs7QUFHRCxTQUFTOEUsU0FBVCxDQUFtQm5KLElBQW5CLEVBQWlDO0VBQzdCLE1BQU11SyxNQUFjLEdBQUcsbUJBQXZCO0VBQ0EsTUFBTTVELE1BQXdCLEdBQUczRyxJQUFJLENBQUM0RixLQUFMLENBQVcyRSxNQUFYLENBQWpDO0VBQ0EsT0FBTzVELE1BQU0sQ0FBQyxDQUFELENBQWI7QUFDSCxFQUdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBLEk7Ozs7Ozs7Ozs7OztBQ3JJQSxpRUFBZSxxQkFBdUIsaURBQWlELEUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9CYWNrZW5kTm90aWZpZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvVGFnQm94L1RhZ0JveC50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vLy4vc3JjL0FkZFRhZ0JveGVzLnRzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL1RhZ0FkZEJ1dHRvbi9UYWdBZGRCdXR0b24uc2NzcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUYWdEYXRhIH0gZnJvbSAnLi9UYWdCb3gvVGFnQm94J1xyXG5cclxuZXhwb3J0IGNsYXNzIEJhY2tlbmROb3RpZmllciB7XHJcbiAgICAvL3N0YXRpYyB0YWdzUmVzb3VyY2U6IHN0cmluZyA9IFwiaHR0cHM6Ly9zb25ndGFnc2JhY2tlbmQuaGVyb2t1YXBwLmNvbS90YWdzL2FqYXkvXCJcclxuICAgIC8vIHN0YXRpYyBhamF5VGFnc0VuZHBvaW50OiBzdHJpbmcgPSBcImh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90YWdzL2FqYXkvXCJcclxuICAgIHN0YXRpYyB0YWdzRW5kcG9pbnQ6IHN0cmluZyA9IFwiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3RhZ3NcIlxyXG5cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgdXBkYXRlVGFnc0ZvclNvbmcodXNlcm5hbWU6c3RyaW5nLCBocmVmOiBzdHJpbmcsIHRhZ3M6IE1hcDxzdHJpbmcsIFRhZ0RhdGE+KSB7XHJcbiAgICAgICAgY29uc3QgZXM2bWFwdG9qc29uID0gSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmZyb21FbnRyaWVzKHRhZ3MuZW50cmllcygpKSlcclxuICAgICAgICByZXR1cm4gYXdhaXQgZmV0Y2goQmFja2VuZE5vdGlmaWVyLnRhZ3NFbmRwb2ludCtcIi9cIit1c2VybmFtZStcIi9cIitocmVmLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXHJcbiAgICAgICAgICAgIG1vZGU6ICdjb3JzJyBhcyBSZXF1ZXN0TW9kZSxcclxuICAgICAgICAgICAgYm9keTogZXM2bWFwdG9qc29uXHJcbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XHJcbiAgICAgICAgICAgIGxldCByZXNwb25zZXRleHQgPSByZXNwb25zZS50ZXh0KCkgXHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZXRleHQ7XHJcbiAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3IpKSB8fCAne30nO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRUYWdzKHVzZXJuYW1lOiBzdHJpbmcsIGhyZWY6c3RyaW5nLCB1cGxvYWRlcjpzdHJpbmcsIHNvbmduYW1lOnN0cmluZywgcGxheWxpc3ROYW1lOnN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGdldFRhZ3NVcmwgPSBgJHtCYWNrZW5kTm90aWZpZXIudGFnc0VuZHBvaW50fS8ke3VzZXJuYW1lfS8ke2hyZWZ9Lz91cGxvYWRlcj0ke3VwbG9hZGVyfSZzb25nbmFtZT0ke3NvbmduYW1lfSZwbGF5bGlzdE5hbWU9JHtwbGF5bGlzdE5hbWV9YFxyXG4gICAgICAgIGxldCB0YWdzU3RyaW5nID0gYXdhaXQgZmV0Y2goZ2V0VGFnc1VybCwge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXHJcbiAgICAgICAgICAgIG1vZGU6ICdjb3JzJyBhcyBSZXF1ZXN0TW9kZSxcclxuICAgICAgICAgICAgLy8gRG9udCBwYXNzIGluIGJvZHkgaW50byBHRVQgcGFyYW1zLCBzb21lIGZyYW1ld29rcnMgZG9udCBwbGF5IG5pY2Ugd2l0aCBpdFxyXG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVzcG9uc2V0ZXh0ID0gcmVzcG9uc2UudGV4dCgpIFxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2V0ZXh0XHJcbiAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3IpKSB8fCAne30nO1xyXG4gICAgICAgIHJldHVybiB0YWdzU3RyaW5nO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IEJhY2tlbmROb3RpZmllciB9IGZyb20gJy4uL0JhY2tlbmROb3RpZmllcic7XG5cblxuZXhwb3J0IGNsYXNzIFRhZ0RhdGEge1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBkYXRlOiBzdHJpbmc7XG4gICAgcG9zaXRpb246IG51bWJlcjtcbiAgICBjb25zdHJ1Y3RvciAodHlwZTogc3RyaW5nID0gXCJkZWZhdWx0XCIsIGRhdGU6IHN0cmluZyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSkge1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmRhdGUgPSBkYXRlO1xuICAgICAgICBpZih0eXBlID09IFwiYXJ0aXN0XCIpIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSA1MDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwidXBsb2FkZXJcIikge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IDEwMDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiZGVmYXVsdFwiKSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gOTk5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IDE1MDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gZXhwb3J0IGNsYXNzIFRhZzIge1xuLy8gICAgIG5hbWU6IHN0cmluZztcbi8vICAgICB0eXBlOiBzdHJpbmc7XG4vLyAgICAgZGF0ZTogc3RyaW5nO1xuLy8gICAgIGNvbnN0cnVjdG9yIChuYW1lOiBzdHJpbmcsIHR5cGU6IHN0cmluZyA9IFwiZGVmYXVsdFwiLCBkYXRlOiBzdHJpbmcgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpIHtcbi8vICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbi8vICAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbi8vICAgICAgICAgdGhpcy5kYXRlID0gZGF0ZTtcbi8vICAgICB9XG4vLyB9XG5cbmV4cG9ydCBjbGFzcyBUYWdCb3gge1xuICAgIHBsYXlsaXN0TmFtZTogc3RyaW5nO1xuICAgIGhyZWY6IHN0cmluZztcblxuICAgIGRpdkVsOiBFbGVtZW50O1xuICAgIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50O1xuXG4gICAgbWF4VGFnczogbnVtYmVyO1xuICAgIHRhZ3M6IE1hcDxzdHJpbmcsIFRhZ0RhdGE+O1xuXG5cbiAgICBjb25zdHJ1Y3RvcihocmVmOiBzdHJpbmcsIHVwbG9hZGVyOiBzdHJpbmcsIHNvbmduYW1lOiBzdHJpbmcsIHBsYXlsaXN0TmFtZTogc3RyaW5nKSB7XG4gICAgICAgIC8vIHRoaXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgLy8gbGV0IHRhZ0JveERpdjogRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuICAgICAgICB0aGlzLnBsYXlsaXN0TmFtZSA9IHBsYXlsaXN0TmFtZTtcbiAgICAgICAgdGhpcy5ocmVmID0gaHJlZjsgXG4gICAgICAgIHRoaXMudGFncyA9IG5ldyBNYXA8c3RyaW5nLCBUYWdEYXRhPigpO1xuICAgICAgICB0aGlzLm1heFRhZ3MgPSAxMCxcblxuICAgICAgICB0aGlzLmRpdkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJyk7XG4gICAgICAgIGlmKHBsYXlsaXN0TmFtZSA9PT0gXCJXYXRjaCBsYXRlclwiKSB7XG4gICAgICAgICAgICAvLyB0aGlzLnVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKSBhcyBIVE1MVUxpc3RFbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRpdkVsLmNsYXNzTGlzdC5hZGQoXCJ0YWdib3hcIik7XG4gICAgICAgICAgICB0aGlzLmRpdkVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0OiBhbnkpID0+IGV2dC5zdG9wUHJvcGFnYXRpb24oKSk7IC8vIE9yIGVsc2Ugd2UgdHJpZ2dlciB5b3V0dWJlcyBjbGljayBoYW5kbGVyIGFuZCBlbnRlciB0aGUgc29uZ1xuICAgICAgICAgICAgdGhpcy5kaXZFbC5pbm5lckhUTUwgPVxuICAgICAgICAgICAgYFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWlucHV0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwiYCArIGhyZWYgKyBgXCIgcGxhY2Vob2xkZXI9XCJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImAgKyBocmVmICsgYFwiIGNsYXNzPXRhZ2xhYmVsPis8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYFxuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IHRoaXMuZGl2RWwucXVlcnlTZWxlY3RvcihcImlucHV0XCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXG4gICAgICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCB0aGlzLmFkZFRhZ0Zyb21Vc2VyLmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAvLyBMZXQgYmFja2VuZCBkbyBhbGwgdGhlIHdvcmsgb2YgZ2V0dGluZyB0YWdzIVxuICAgICAgICAgICAgQmFja2VuZE5vdGlmaWVyLmdldFRhZ3MoXCJhamF5XCIsIHRoaXMuaHJlZiwgdXBsb2FkZXIsIHNvbmduYW1lLCBwbGF5bGlzdE5hbWUpLnRoZW4odGFnc1N0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHRhZ3M6IE1hcDxzdHJpbmcsIFRhZ0RhdGE+ID0gbmV3IE1hcChPYmplY3QuZW50cmllcyhKU09OLnBhcnNlKHRhZ3NTdHJpbmcpKSk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICB0aGlzLnJlYnVpbGRUYWdzKCk7ICAgICAgICAgICAgIC8vIG5lZWRlZCBmb3IgZmlyc3QgcnVudGhyb3VnaFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdlIHVzZSB0aGlzIG1hcCB0byBlbmFibGUgYnVsayB1cGRhdGVzIGluc3RlYWQgb2Ygb25lIGJ5IG9uZSB3aGVuZXZlciBhIGNoYW5nZSBvY2N1cnNcbiAgICAvLyBhZGRUYWdzKGF1dG9tYXRlZFRhZ3M6IE1hcDxzdHJpbmcsIFRhZ0RhdGE+LCBiYWNrZW5kVGFnczpNYXA8c3RyaW5nLCBUYWdEYXRhPikge1xuICAgIGFkZFRhZ3ModGFnczogTWFwPHN0cmluZywgVGFnRGF0YT4pIHtcbiAgICAgICAgbGV0IGlzTmV3VGFnID0gZmFsc2U7XG4gICAgICAgIHRhZ3MuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgaXNOZXdUYWcgPSB0aGlzLmFkZFRhZ1RvTG9jYWwoa2V5LCB2YWx1ZS50eXBlKTtcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIGlmKGlzTmV3VGFnKSB7IFxuICAgICAgICAgICAgQmFja2VuZE5vdGlmaWVyLnVwZGF0ZVRhZ3NGb3JTb25nKFwiYWpheVwiLCB0aGlzLmhyZWYsIHRoaXMudGFncyk7IFxuICAgICAgICAgICAgdGhpcy5yZWJ1aWxkVGFncygpOyAgIFxuICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGRvIHRoaXMgZm9yIGZpcnN0IHRpbWUgb25seSB0byBjcmVhdGUgdGFncyBvbiBmcm9udGVuZFxuICAgIH1cblxuICAgIGFkZFRhZ1RvTG9jYWwodGFnTmFtZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcgPSBcImRlZmF1bHRcIik6IGJvb2xlYW4ge1xuICAgICAgICAvLyBDYW4gaGF2ZSB1cCB0byAxMCB0YWdzLiBObyBkdXBsaWNhdGVzLiBNaW5pbXVtIGxlbmd0aCA9IDFcbiAgICAgICAgbGV0IGlzTmV3VGFnID0gZmFsc2U7XG4gICAgICAgIGlmKCF0aGlzLnRhZ3MuaGFzKHRhZ05hbWUpKXtcbiAgICAgICAgICAgIGlzTmV3VGFnID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKHRoaXMudGFncy5zaXplID49IDEwKSByZXR1cm4gZmFsc2U7IFxuICAgICAgICAgICAgdGhpcy50YWdzLnNldCh0YWdOYW1lLCBuZXcgVGFnRGF0YSh0eXBlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzTmV3VGFnO1xuICAgIH1cblxuICAgIC8vIFJlYWRzIGlucHV0IGZpZWxkIGFuZCBhZGRzIHRoZSB0YWdcbiAgICBhZGRUYWdGcm9tVXNlcihlOktleWJvYXJkRXZlbnQpe1xuICAgICAgICBpZiAoZS5rZXkgIT09ICdFbnRlcicpIHJldHVybjtcbiAgICAgICAgbGV0IGlucHV0RWwgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICBsZXQgdGFnTmFtZSA9IGlucHV0RWwudmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuXG4gICAgICAgIHRoaXMuYWRkVGFncyhuZXcgTWFwPHN0cmluZywgVGFnRGF0YT4oW1t0YWdOYW1lLCBuZXcgVGFnRGF0YShcImRlZmF1bHRcIildXSkpO1xuICAgICAgICBpbnB1dEVsLnZhbHVlID0gXCJcIjtcbiAgICB9XG5cbiAgICByZW1vdmVUYWcoZXZ0Ok1vdXNlRXZlbnQsIHRhZ05hbWU6IHN0cmluZyl7XG4gICAgICAgIGxldCBlbGVtZW50ID0gZXZ0LnRhcmdldCBhcyBFbGVtZW50O1xuICAgICAgICBjb25zb2xlLmxvZygnUmVtb3ZpbmcgdGFnIGVsZW1lbnQ6JywgZWxlbWVudCk7XG4gICAgICAgIGlmKCFlbGVtZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMudGFncy5kZWxldGUodGFnTmFtZSlcbiAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgQmFja2VuZE5vdGlmaWVyLnVwZGF0ZVRhZ3NGb3JTb25nKFwiYWpheVwiLCB0aGlzLmhyZWYsIHRoaXMudGFncyk7XG4gICAgfVxuXG4gICAgLy8gUmVidWlsZHMgdGhlIHRhZyBib3ggY29udGVudHMgZm9yIHRoZSBhc3NvY2lhdGVkIGhyZWZcbiAgICByZWJ1aWxkVGFncygpe1xuICAgICAgICB0aGlzLmRpdkVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJhXCIpLmZvckVhY2gobGkgPT4gbGkucmVtb3ZlKCkpO1xuICAgICAgICB0aGlzLnRhZ3MuZm9yRWFjaCgodGFnLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGxldCBhbmNob3JUYWc6IEhUTUxBbmNob3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgYW5jaG9yVGFnLmhyZWYgPSBcImphdmFzY3JpcHQ6O1wiO1xuICAgICAgICAgICAgYW5jaG9yVGFnLmNsYXNzTGlzdC5hZGQoXCJwaWxsXCIpO1xuICAgICAgICAgICAgYW5jaG9yVGFnLmNsYXNzTGlzdC5hZGQodGFnLnR5cGUpOyAvLyB3aWxsIGJlIHVzZWQgdG8gZ2l2ZSBkaWZmZXJlbnQgY29sb3IgdG8gdGFnc1xuICAgICAgICAgICAgYW5jaG9yVGFnLmlubmVySFRNTCA9IGBcXCMke2tleX0gYFxuICAgICAgICAgICAgbGV0IHJlbW92ZVRhZ0JvdW5kID0gdGhpcy5yZW1vdmVUYWcuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIGFuY2hvclRhZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldnQpID0+IHJlbW92ZVRhZ0JvdW5kKGV2dCxrZXkpKTtcbiAgICAgICAgICAgIHRoaXMuZGl2RWwuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYWZ0ZXJiZWdpblwiLCBhbmNob3JUYWcpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIHBhcnNlRGF0YShzb25nbmFtZTogc3RyaW5nLCB1cGxvYWRlcjogc3RyaW5nLCBwbGF5bGlzdE5hbWU6IHN0cmluZykge1xuICAgICAgICBsZXQgdGFnc1RvQWRkID0gbmV3IE1hcDxzdHJpbmcsIFRhZ0RhdGE+KCk7XG4gICAgICAgIGxldCBhcnRpc3RGb3VuZDogYm9vbGVhbiA9IGZhbHNlOyBcbiAgICAgICAgXG4gICAgICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgICAqICAgICAgICAgICAgICAgICBSZWdleCB0byBwYXJzZSBwbGF5bGlzdCBuYW1lICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLyAgXG4gICAgICAgIGNvbnN0IE9TVFBsYXlsaXN0UmVnZXggPSBuZXcgUmVnRXhwKCdHYW1lL1RWL01vdmllIE9TVCcpXG4gICAgICAgIGlmIChPU1RQbGF5bGlzdFJlZ2V4LnRlc3QocGxheWxpc3ROYW1lKSkgdGFnc1RvQWRkLnNldChcIk9TVFwiLCBuZXcgVGFnRGF0YShcImNhdGVnb3J5XCIpKTtcblxuICAgICAgICBjb25zdCBjbGFzc2ljc1BsYXlsaXN0UmVnZXggPSBuZXcgUmVnRXhwKCdeQ2xhc3NpY3MkJylcbiAgICAgICAgaWYgKGNsYXNzaWNzUGxheWxpc3RSZWdleC50ZXN0KHBsYXlsaXN0TmFtZSkpIHRhZ3NUb0FkZC5zZXQoXCLhm4Thm4Thm4Thm4Thm4RcIiwgbmV3IFRhZ0RhdGEoXCJHT0FUXCIpKTtcblxuICAgICAgICB0YWdzVG9BZGQuc2V0KFwiSU5QTEFZTElTVFwiLCBuZXcgVGFnRGF0YSAoXCJtZXRhZGF0YVwiKSk7XG5cbiAgICAgICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICogICAgICAgUmVnZXggdG8gcGFyc2Ugc29uZyBuYW1lIGFuZCBnZXQgZXh0cmEgaW5mb3JtYXRpb24gICAgICAgICpcbiAgICAgICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovICBcbiAgICAgICAgLyogUmVnZXggdG8gcGFyc2Ugc29uZyBuYW1lIGFuZCBnZXQgZXh0cmEgaW5mb3JtYXRpb24qL1xuICAgICAgICBjb25zdCBuaWdodGNvcmVSZWdleCA9IG5ldyBSZWdFeHAoJ25pZ2h0Y29yZScsICdpJylcbiAgICAgICAgaWYgKG5pZ2h0Y29yZVJlZ2V4LnRlc3Qoc29uZ25hbWUpKSB0YWdzVG9BZGQuc2V0KFwiTmlnaHRjb3JlXCIsIG5ldyBUYWdEYXRhKFwiY2F0ZWdvcnlcIikpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdGFub2NSZWdleCA9IG5ldyBSZWdFeHAoJ3VzYW98ZGogbm9yaWtlbnxrbzN8TWFzc2l2ZSBOZXcgS3Jld3xSRURBTGlDRXxMYXVyfGtvcnMga3xTcmF2M1J8YXJhbnxIb21tYXJqdXxESiBHZW5raXxESiBNeW9zdWtlfHRcXFxcK3Bhem9saXRlfFJvdWdoU2tldGNofEtvYmFyeW98UFxcXFwqTGlnaHR8bm9yYTJyfFJlbGVjdHxHZXR0eXxUYXRzdW5vc2hpbicsICdpJylcbiAgICAgICAgaWYgKHRhbm9jUmVnZXgudGVzdChzb25nbmFtZSkpIHRhZ3NUb0FkZC5zZXQoXCJUQU5PKkNcIiwgbmV3IFRhZ0RhdGEoXCJjYXRlZ29yeVwiKSk7XG5cbiAgICAgICAgY29uc3QgdG91aG91UmVnZXggPSBuZXcgUmVnRXhwKCfmnbHmlrl8VG91aG91JywgJ2knKVxuICAgICAgICBpZiAodG91aG91UmVnZXgudGVzdChzb25nbmFtZSkpIHRhZ3NUb0FkZC5zZXQoXCLmnbHmlrlcIiwgbmV3IFRhZ0RhdGEoXCJjYXRlZ29yeVwiKSlcblxuICAgICAgICAvKiBWb2NhbG9pZCAqL1xuICAgICAgICBjb25zdCBtaWt1UmVnZXggPSBuZXcgUmVnRXhwKCdNaWt1fOODn+OCrycsICdpJylcbiAgICAgICAgaWYgKG1pa3VSZWdleC50ZXN0KHNvbmduYW1lKSkgdGFnc1RvQWRkLnNldChcIuODn+OCr1wiLCBuZXcgVGFnRGF0YShcInZvY2Fsb2lkXCIpKTtcblxuICAgICAgICBjb25zdCBrYWZ1UmVnZXggPSBuZXcgUmVnRXhwKCdLYWZ1fOWPr+S4jScsICdpJylcbiAgICAgICAgaWYgKGthZnVSZWdleC50ZXN0KHNvbmduYW1lKSkgdGFnc1RvQWRkLnNldChcIuWPr+S4jVwiLCBuZXcgVGFnRGF0YShcInZvY2Fsb2lkXCIpKTtcblxuICAgICAgICBjb25zdCBzbGF2ZVJlZ2V4ID0gbmV3IFJlZ0V4cCgnU2xhdmVcXC5WLVYtUicsICdpJylcbiAgICAgICAgaWYgKHNsYXZlUmVnZXgudGVzdChzb25nbmFtZSkpIHRhZ3NUb0FkZC5zZXQoXCJTbGF2ZS5WLVYtUlwiLCBuZXcgVGFnRGF0YShcInZvY2Fsb2lkXCIpKTtcblxuICAgICAgICBjb25zdCBpYVJlZ2V4ID0gbmV3IFJlZ0V4cCgnIElBJylcbiAgICAgICAgaWYgKGlhUmVnZXgudGVzdChzb25nbmFtZSkpIHRhZ3NUb0FkZC5zZXQoXCJJQVwiLCBuZXcgVGFnRGF0YShcInZvY2Fsb2lkXCIpKTtcblxuXG4gICAgICAgIC8qIEdhbWUgYW5kIEFuaW1lICovXG4gICAgICAgIGNvbnN0IGdhbWVSZWdleCA9IG5ldyBSZWdFeHAoJyhCbHVlIEFyY2hpdmV8Q291bnRlcnNpZGV8TG9zdCBBcmt8QXJrbmlnaHRzKScsICdpJylcbiAgICAgICAgY29uc3QgZ2FtZU1hdGNoID0gc29uZ25hbWUubWF0Y2goZ2FtZVJlZ2V4KVxuICAgICAgICBpZiAoZ2FtZU1hdGNoKSB7dGFnc1RvQWRkLnNldChnYW1lTWF0Y2hbMV0udHJpbSgpLCBuZXcgVGFnRGF0YShcImdhbWVcIikpOyBhcnRpc3RGb3VuZCA9IHRydWU7fVxuXG4gICAgICAgIGNvbnN0IHBlcnNvbmE1UmVnZXggPSBuZXcgUmVnRXhwKCcoUDV8UDVSfFBlcnNvbmEgNSknKVxuICAgICAgICBjb25zdCBwZXJzb25hNU1hdGNoID0gc29uZ25hbWUubWF0Y2gocGVyc29uYTVSZWdleCk7XG4gICAgICAgIGlmIChwZXJzb25hNU1hdGNoKSB7IHRhZ3NUb0FkZC5zZXQoXCJQZXJzb25hIDVcIiwgbmV3IFRhZ0RhdGEoXCJnYW1lXCIpKTsgYXJ0aXN0Rm91bmQgPSB0cnVlO31cbiAgICAgICAgY29uc3QgcGVyc29uYTRSZWdleCA9IG5ldyBSZWdFeHAoJyhQNHxQNEd8UGVyc29uYSA0KScpXG4gICAgICAgIGNvbnN0IHBlcnNvbmE0TWF0Y2ggPSBzb25nbmFtZS5tYXRjaChwZXJzb25hNFJlZ2V4KTtcbiAgICAgICAgaWYgKHBlcnNvbmE0TWF0Y2gpIHt0YWdzVG9BZGQuc2V0KFwiUGVyc29uYSA0XCIsIG5ldyBUYWdEYXRhKFwiZ2FtZVwiKSk7IGFydGlzdEZvdW5kID0gdHJ1ZTt9XG5cbiAgICAgICAgY29uc3QgZGFuZ2Fucm9ucGFSZWdleCA9IG5ldyBSZWdFeHAoJyhEYW5nYW5yb25wYXxEYW5nYW5yb25wYSAyfFNEUjJ8RGFuZ2Fucm9ucGEgVjN8RGFuZ2Fucm9ucGEgMyknKVxuICAgICAgICBjb25zdCBkYW5nYW5yb25wYU1hdGNoID0gc29uZ25hbWUubWF0Y2goZGFuZ2Fucm9ucGFSZWdleCk7XG4gICAgICAgIGlmIChkYW5nYW5yb25wYU1hdGNoKSB7dGFnc1RvQWRkLnNldChcIkRhbmdhbnJvbnBhXCIsIG5ldyBUYWdEYXRhKFwiZ2FtZVwiKSk7IGFydGlzdEZvdW5kID0gdHJ1ZTt9XG5cbiAgICAgICAgY29uc3QgaG9ua2FpUmVnZXggPSBuZXcgUmVnRXhwKCcoSEkzfEhvbmthaSBJbXBhY3QgM3xIb3VrYWkgSW1wYWN0IDMpJylcbiAgICAgICAgY29uc3QgaG9ua2FpTWF0Y2ggPSBzb25nbmFtZS5tYXRjaChob25rYWlSZWdleCk7XG4gICAgICAgIGlmIChob25rYWlNYXRjaCkge3RhZ3NUb0FkZC5zZXQoXCJIb25rYWkgSW1wYWN0IDNyZFwiLCBuZXcgVGFnRGF0YShcImdhbWVcIikpOyBhcnRpc3RGb3VuZCA9IHRydWU7fVxuXG4gICAgICAgIGNvbnN0IGFuaW1lUmVnZXggPSBuZXcgUmVnRXhwKCcoQmxlYWNofEdpbnRhbWF8TGluayBDbGljayknLCAnaScpXG4gICAgICAgIGNvbnN0IGFuaW1lTWF0Y2ggPSBzb25nbmFtZS5tYXRjaChhbmltZVJlZ2V4KVxuICAgICAgICBpZiAoYW5pbWVNYXRjaCkge3RhZ3NUb0FkZC5zZXQoYW5pbWVNYXRjaFsxXS50cmltKCksIG5ldyBUYWdEYXRhKFwiYW5pbWVcIikpOyBhcnRpc3RGb3VuZCA9IHRydWU7fVxuICAgICAgICBcblxuXG5cbiAgICAgICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICogICAgICBSZWdleCB0byBwYXJzZSB1cGxvYWRlciBuYW1lIChhbmQgdHJ5IHRvIGZpbmQgYXJ0aXN0KSAgICAgICpcbiAgICAgICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovICBcbiAgICAgICAgLy8gQ2FzZSAwIC0gQXJ0aXN0IGFscmVhZHkgZm91aW5kIFxuICAgICAgICAgaWYoYXJ0aXN0Rm91bmQpIHJldHVybiB0YWdzVG9BZGQ7IFxuXG4gICAgICAgIC8vIENhc2UgMSAtIEZvdW5kIGFydGlzdCB0aHJvdWdoIHRvcGljXG4gICAgICAgIGNvbnN0IHRvcGljUmVnZXggPSBuZXcgUmVnRXhwKCcgLSBUb3BpYycsICdpJylcbiAgICAgICAgaWYgKHRvcGljUmVnZXgudGVzdCh1cGxvYWRlcikpIHtcbiAgICAgICAgICAgIHRhZ3NUb0FkZC5zZXQodXBsb2FkZXIuc2xpY2UoMCwgLTgpLCBuZXcgVGFnRGF0YShcImFydGlzdFwiKSk7XG4gICAgICAgICAgICByZXR1cm4gdGFnc1RvQWRkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FzZSAyIC0gRm91bmQgYXJ0aXN0IGJ5IHJlbW92aW5nIE9mZmljaWFsXG4gICAgICAgIGNvbnN0IG9mZmljaWFsUmVnZXggPSBuZXcgUmVnRXhwKCcoLio/KSBPZmZpY2lhbCcsICdpJylcbiAgICAgICAgcmVzdWx0ID0gdXBsb2FkZXIubWF0Y2gob2ZmaWNpYWxSZWdleCkgYXMgUmVnRXhwTWF0Y2hBcnJheTtcbiAgICAgICAgaWYocmVzdWx0KXtcbiAgICAgICAgICAgIHRhZ3NUb0FkZC5zZXQocmVzdWx0WzFdLCBuZXcgVGFnRGF0YShcImFydGlzdFwiKSlcbiAgICAgICAgICAgIHJldHVybiB0YWdzVG9BZGQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYXNlIDMgLSBGb3VuZCBhcnRpc3QgYnkgcmVtb3ZpbmcgXFxcbiAgICAgICAgY29uc3Qgc2xhc2hSZWdleCA9IG5ldyBSZWdFeHAoJyguKj8pIFxcLycpXG4gICAgICAgIHZhciByZXN1bHQ6IFJlZ0V4cE1hdGNoQXJyYXkgPSB1cGxvYWRlci5tYXRjaChzbGFzaFJlZ2V4KSBhcyBSZWdFeHBNYXRjaEFycmF5O1xuICAgICAgICBpZihyZXN1bHQpIHtcbiAgICAgICAgICAgIHRhZ3NUb0FkZC5zZXQocmVzdWx0WzFdLCBuZXcgVGFnRGF0YShcImFydGlzdFwiKSlcbiAgICAgICAgICAgIHJldHVybiB0YWdzVG9BZGQ7XG4gICAgICAgIH1cbiBcbiAgICAgICAgLy8gQ2FzZSA0IC0gRm91bmQgYXJ0aXN0IGFzIHVwbG9hZGVyIG5hbWUgIGV4aXN0cyBpbiBzb25nIG5hbWUgXG4gICAgICAgIGNvbnN0IHVwbG9hZGVySW5Tb25nTmFtZVJlZ2V4ID0gbmV3IFJlZ0V4cCh1cGxvYWRlciwgJ2knKVxuICAgICAgICBpZiAodXBsb2FkZXJJblNvbmdOYW1lUmVnZXgudGVzdChzb25nbmFtZSkpIHtcbiAgICAgICAgICAgIHRhZ3NUb0FkZC5zZXQodXBsb2FkZXIsIG5ldyBUYWdEYXRhKFwiYXJ0aXN0XCIpKTtcbiAgICAgICAgICAgIHJldHVybiB0YWdzVG9BZGQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYXNlIDUgLSBGb3VuZCBhcnRpc3QgdGhhdCBoYXMg44G+44G144G+44G144Gh44KD44KT44Gt44KLXG4gICAgICAgIGNvbnN0IOOBoeOCg+OCk+OBreOCi0luVXBsb2FkZXJOYW1lUmVnZXggPSBuZXcgUmVnRXhwKCcoLio/KeOBoeOCg+OCk+OBreOCiycsICdpJylcbiAgICAgICAgdmFyIHJlc3VsdDogUmVnRXhwTWF0Y2hBcnJheSA9IHVwbG9hZGVyLm1hdGNoKOOBoeOCg+OCk+OBreOCi0luVXBsb2FkZXJOYW1lUmVnZXgpIGFzIFJlZ0V4cE1hdGNoQXJyYXk7XG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgIHRhZ3NUb0FkZC5zZXQocmVzdWx0WzFdLCBuZXcgVGFnRGF0YShcImFydGlzdFwiKSk7XG4gICAgICAgICAgICByZXR1cm4gdGFnc1RvQWRkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FzZSA2IC0gRm91bmQgYXJ0aXN0IHRoYXQgaGFzIGZlYXQuIGluIHRpdGxlXG5cbiAgICAgICAgLy8gQ2FzZSA5OTcgLSBLTU5aIHggRVhBTVBMRSBpcyBpbiB0aXRsZSwgdXBsb2FkZXIgaXMgS01OWiBMSVRBXG5cbiAgICAgICAgLy8gQ2FzZSA0OTlcblxuICAgICAgICAvLyBDYXNlIDk5OCAtIERlbGltaXQgb24gJy0nIGxtYW8uLlxuICAgICAgICBjb25zdCBkYXNoUmVnZXggPSBuZXcgUmVnRXhwKCcoLio/KSAtLionKVxuICAgICAgICB2YXIgcmVzdWx0OiBSZWdFeHBNYXRjaEFycmF5ID0gc29uZ25hbWUubWF0Y2goZGFzaFJlZ2V4KSBhcyBSZWdFeHBNYXRjaEFycmF5O1xuICAgICAgICBpZihyZXN1bHQpIHtcbiAgICAgICAgICAgIHRhZ3NUb0FkZC5zZXQocmVzdWx0WzFdLCBuZXcgVGFnRGF0YShcImFydGlzdFwiKSlcbiAgICAgICAgICAgIHJldHVybiB0YWdzVG9BZGQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYXNlIDk5OSAtIFJldHVybiB1cGxvYWRlciBvbmx5Li4gYXJ0aXN0IG5vdCBmb3VuZFxuICAgICAgICB0YWdzVG9BZGQuc2V0KHVwbG9hZGVyLCBuZXcgVGFnRGF0YShcInVwbG9hZGVyXCIpKTtcbiAgICAgICAgcmV0dXJuIHRhZ3NUb0FkZDtcbiAgICB9XG5cblxuXG5cbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjsiLCJpbXBvcnQgeyBUYWdCb3ggfSBmcm9tICcuL2NvbXBvbmVudHMvVGFnQm94L1RhZ0JveCc7XG5cbmNvbnN0IGRlbGF5ID0gKHQ6bnVtYmVyKSA9PiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdCkpO1xuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRVcmw6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgIGNvbnN0IHBsYXlsaXN0UmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoJ3lvdXR1YmVcXC5jb21cXC9wbGF5bGlzdFxcXFw/bGlzdD0nLCAnaScpXG4gICAgaWYgKHBsYXlsaXN0UmVnZXgudGVzdChjdXJyZW50VXJsKSkgYWRkVGFnQm94ZXNUb1BsYXlsaXN0SXRlbXMoKTtcbiAgICBjb25zdCBwbGF5bGlzdFNvbmdSZWdleDogUmVnRXhwID0gbmV3IFJlZ0V4cCgneW91dHViZS5jb20vd2F0Y2hcXFxcP3Y9KC4qKVxcJmxpc3Q9JywgJ2knKVxuICAgIGlmIChwbGF5bGlzdFNvbmdSZWdleC50ZXN0KGN1cnJlbnRVcmwpKSB3YWl0Rm9yRWxlbWVudCgnYWJvdmUtdGhlLWZvbGQnKTtcbn1cblxuY29uc3Qgd2FpdEZvckVsZW1lbnQgPSBhc3luYyAoc2VsZWN0b3I6YW55LCByb290RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBXYWl0aW5nIGZvciAke3NlbGVjdG9yfS4uLmAsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XG4gICAgbGV0IGNvbmZpZyA9IHtcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIH1cbiAgICAvLyBGaXJzdCwgZG8gc3R1ZmYgd2hlbiBlbGVtZW50IHNwYXduc1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke3NlbGVjdG9yfSB3YXMgZm91bmQhYCwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICBhZGRUYWdCb3hlc1RvU29uZygpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGVsZW1lbnQgYXMgSFRNTERpdkVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShyb290RWxlbWVudCwgY29uZmlnKTtcbiAgICB9KS50aGVuKGVsZW1lbnQgPT4ge1xuICAgIC8vIFNlY29uZCwgZG8gc3R1ZmYgd2hlbmV2ZXIgdGhhdCBlbGVtZW50IGNoYW5nZXNcbiAgICAgICAgc2VsZWN0b3IgPSAnZGl2I2Fib3ZlLXRoZS1mb2xkIGRpdiN0aXRsZSBoMScgLy8gZWxlbWVudCB0aGF0IGhvbGRzIHRpdGxlXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uQ2hhbmdlZCA9IGZ1bmN0aW9uIChtdXRhdGlvbnNMaXN0OmFueSwgb2JzZXJ2ZXI6YW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtdXRhdGlvbnNMaXN0KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDaGFuZ2VzIGRldGVjdGVkIGluICR7c2VsZWN0b3J9YCwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIGRlbGV0ZVRhZ0JveGVzKCk7XG4gICAgICAgICAgICBhZGRUYWdCb3hlc1RvU29uZygpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZGVzY3JpcHRpb25DaGFuZ2VkKVxuICAgICAgICBkZXNjcmlwdGlvbk9ic2VydmVyLm9ic2VydmUoKGVsZW1lbnQgYXMgSFRNTERpdkVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLCBjb25maWcpXG4gICAgfSlcbn07XG5cbmZ1bmN0aW9uIGFkZFRhZ0JveGVzVG9Tb25nKCkge1xuICAgIC8vIHByaW1hcnlFbC5xdWVyeVNlbGVjdG9yKFwiZGl2LndhdGNoLWFjdGl2ZS1tZXRhZGF0YSBkaXY6bnRoLWNoaWxkKDIpXCIpXG4gICAgdmFyIGNoYW5uZWxOYW1lRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd5dC1mb3JtYXR0ZWQtc3RyaW5nW2NsYXNzKj1cInl0ZC1jaGFubmVsLW5hbWVcIl0gYScpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuICAgIHZhciBzb25nTmFtZUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdltpZD1cXFwiY29udGFpbmVyXFxcIl0gaDEgeXQtZm9ybWF0dGVkLXN0cmluZ1wiKSBhcyBIVE1MRWxlbWVudFxuICAgIHZhciBwbGF5bGlzdE5hbWVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2gzIHl0LWZvcm1hdHRlZC1zdHJpbmcgYVtocmVmXj1cIi9wbGF5bGlzdFwiXScpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuXG4gICAgY29uc29sZS5sb2cocGxheWxpc3ROYW1lRWwuaW5uZXJUZXh0LCBjaGFubmVsTmFtZUVsLmlubmVyVGV4dCwgc29uZ05hbWVFbC5pbm5lclRleHQpO1xuXG4gICAgY29uc3QgYmVsb3dUaGVQbGF5ZXJFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXZbaWQ9XFxcImFib3ZlLXRoZS1mb2xkXFxcIl1cIikgYXMgSFRNTERpdkVsZW1lbnQ7XG5cbiAgICBjb25zdCB0YWdCb3hFbCA9IG5ldyBUYWdCb3gocGFyc2VIcmVmKHdpbmRvdy5sb2NhdGlvbi5ocmVmKSwgY2hhbm5lbE5hbWVFbC5pbm5lclRleHQsIHNvbmdOYW1lRWwuaW5uZXJUZXh0LCBwbGF5bGlzdE5hbWVFbC5pbm5lclRleHQpXG5cbiAgICBiZWxvd1RoZVBsYXllckVsLmluc2VydEJlZm9yZSh0YWdCb3hFbC5kaXZFbCwgYmVsb3dUaGVQbGF5ZXJFbC5maXJzdENoaWxkKTtcbiAgICBjb25zb2xlLmxvZyhcIkFkZGVkIHRhZ2JveCB0byBjdXJyZW50bHkgcGxheWluZyBzb25nXCIsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XG5cbn1cblxuZnVuY3Rpb24gYWRkVGFnQm94ZXNUb1BsYXlsaXN0SXRlbXMoKSB7XG4gICAgLy8gVHJhdmVyc2luZyB0aGUgQWN0dWFsIFNvbmcgUGFuZXNcbiAgICBjb25zdCBkaXNwbGF5RGlhbG9nRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjZGlzcGxheS1kaWFsb2cnKVswXSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAvLyBjb25zb2xlLmxvZyhwbGF5bGlzdE5hbWVFbCk7XG4gICAgLy8gY29uc29sZS5sb2cocGxheWxpc3ROYW1lRWwuaW5uZXJUZXh0KTtcbiAgICBjb25zdCBzb25nUGFuZXM6IE5vZGVMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdiB5dGQtcGxheWxpc3QtdmlkZW8tcmVuZGVyZXJcIik7IFxuICAgIHNvbmdQYW5lcy5mb3JFYWNoKChzb25nUGFuZSkgPT4ge1xuICAgICAgICBsZXQgc29uZ1BhbmVFbCA9IHNvbmdQYW5lIGFzIEVsZW1lbnQ7XG5cbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZGl2IHRoYXQgcmVwcmVzZW50cyB0aGUgd2hvbGUgcm93XG4gICAgICAgIGNvbnN0IGNvbnRlbnRFbCA9IHNvbmdQYW5lRWwuY2hpbGRyZW5bMV0gYXMgSFRNTERpdkVsZW1lbnQ7XG5cbiAgICAgICAgLy8gVGhpcyBpcyB5b3V0dWJlcyBjb250YWluZXIgZWxlbWVudCBpbmNsdWRpbmcgd2hpY2ggY29udGFpbnMgdGhlIHRodW1ibmFpbCBhbmQgbWV0YWRhdGFcbiAgICAgICAgY29uc3QgY29udGFpbmVyRWwgPSBjb250ZW50RWwuY2hpbGRyZW5bMF0gYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgIGNvbnRhaW5lckVsLnN0eWxlLmFsaWduSXRlbXMgPSAnY2VudGVyJztcbiAgICAgICAgY29udGVudEVsLnN0eWxlLmZsZXhXcmFwID0gJ25vd3JhcCdcblxuICAgICAgICAvLyBXaXRoaW4gdGhlIHRodW1ibmFpbCB3ZSBjYW4gZ2V0IHRoZSBocmVmXG4gICAgICAgIGNvbnN0IHRodW1ibmFpbEVsID0gY29udGFpbmVyRWwuY2hpbGRyZW5bMF0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGFuY2hvckVsID0gdGh1bWJuYWlsRWwuY2hpbGRyZW5bMF0gYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG5cbiAgICAgICAgLy8gV2l0aGluIHRoZSBtZXRhZGF0YSB3ZSBjYW4gZ2V0IHRoZSBzb25nIHRpdGxlLCBhdXRob3JcbiAgICAgICAgY29uc3QgbWV0YUVsID0gY29udGFpbmVyRWwuY2hpbGRyZW5bMV07XG4gICAgICAgIGNvbnN0IG1ldGFEYXRhRWwgPSBtZXRhRWwuY2hpbGRyZW5bMV0uY2hpbGRyZW5bMF0gYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGNoYW5uZWxOYW1lQ29udGFpbmVyRWwgPSBtZXRhRGF0YUVsLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzBdIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBjaGFubmVsTmFtZUVsID0gY2hhbm5lbE5hbWVDb250YWluZXJFbC5jaGlsZHJlblswXS5jaGlsZHJlblswXS5jaGlsZHJlblswXSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcblxuICAgICAgICBjb25zdCBzb25nTmFtZUVsID0gbWV0YUVsLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzFdIGFzIEhUTUxBbmNob3JFbGVtZW50XG4gICAgICAgIGNvbnN0IHBsYXlsaXN0TmFtZUVsID0gZGlzcGxheURpYWxvZ0VsLmNoaWxkcmVuWzFdIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHRhZ0JveEVsID0gbmV3IFRhZ0JveChwYXJzZUhyZWYoYW5jaG9yRWwuaHJlZiksIGNoYW5uZWxOYW1lRWwuaW5uZXJUZXh0LCBzb25nTmFtZUVsLmlubmVyVGV4dCwgcGxheWxpc3ROYW1lRWwuaW5uZXJUZXh0KVxuICAgICAgICBjb25zb2xlLmxvZygnVGhpcyBzb25ncyBwYXJzZWQgdXJsIGlzOiAnLCBwYXJzZUhyZWYoYW5jaG9yRWwuaHJlZikpO1xuICAgICAgICBjb250ZW50RWwuYXBwZW5kQ2hpbGQodGFnQm94RWwuZGl2RWwpO1xuICAgIH0pXG59XG5cblxuZnVuY3Rpb24gZGVsZXRlVGFnQm94ZXMoKSB7XG4gICAgY29uc3QgdGFnQm94V3JhcHBlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudGFnYm94JykgYXMgTm9kZUxpc3RPZjxFbGVtZW50PjtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgdGFnQm94V3JhcHBlcnMpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gcGFyc2VIcmVmKGhyZWY6IHN0cmluZykge1xuICAgIGNvbnN0IHJlZ2V4cDogUmVnRXhwID0gL3dhdGNoXFw/dj0oLio/KVxcJi9pO1xuICAgIGNvbnN0IHJlc3VsdDogUmVnRXhwTWF0Y2hBcnJheSA9IGhyZWYubWF0Y2gocmVnZXhwKSBhcyBSZWdFeHBNYXRjaEFycmF5O1xuICAgIHJldHVybiByZXN1bHRbMV07XG59XG5cblxuLy8gZnVuY3Rpb24gc3RhcnRIcmVmT2JzZXJ2ZXIoY3VycmVudGhyZWY6IHN0cmluZykge1xuLy8gICAgIHZhciBib2R5TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpIGFzIEhUTUxCb2R5RWxlbWVudDtcbi8vICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihtdXRhdGlvbnMpIHtcbi8vICAgICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24obXV0YXRpb24pIHtcbi8vICAgICAgICAgICAgIGlmIChjdXJyZW50aHJlZiAhPSB3aW5kb3cubG9jYXRpb24uaHJlZikge1xuLy8gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT2JzZXJ2ZXIgZGV0ZWN0ZWQgaHJlZiBjaGFuZ2VcIiwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcbi8vICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQ6IFwiICsgY3VycmVudGhyZWYsIFwiT2xkOiBcIiArIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbi8vICAgICAgICAgICAgICAgICBjdXJyZW50aHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuLy8gICAgICAgICAgICAgICAgIGRlbGV0ZVRhZ0JveGVzKCk7XG4vLyAgICAgICAgICAgICAgICAgaW5pdGlhbGl6ZVRhZ0JveGVzKCk7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH0pO1xuLy8gICAgIH0pO1xuICAgIFxuLy8gICAgIHZhciBjb25maWcgPSB7XG4vLyAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbi8vICAgICAgICAgc3VidHJlZTogdHJ1ZVxuLy8gICAgIH07XG4gICAgXG4vLyAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShib2R5TGlzdCwgY29uZmlnKTtcbi8vIH1cblxuXG5cblxuIiwiZXhwb3J0IGRlZmF1bHQgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcInNyYy9jb21wb25lbnRzL1RhZ0FkZEJ1dHRvbi9UYWdBZGRCdXR0b24uY3NzXCI7Il0sIm5hbWVzIjpbIkJhY2tlbmROb3RpZmllciIsInRhZ3NFbmRwb2ludCIsInVwZGF0ZVRhZ3NGb3JTb25nIiwidXNlcm5hbWUiLCJocmVmIiwidGFncyIsImVzNm1hcHRvanNvbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJPYmplY3QiLCJmcm9tRW50cmllcyIsImVudHJpZXMiLCJmZXRjaCIsIm1ldGhvZCIsInJlZGlyZWN0IiwibW9kZSIsImJvZHkiLCJ0aGVuIiwicmVzcG9uc2UiLCJyZXNwb25zZXRleHQiLCJ0ZXh0IiwiY2F0Y2giLCJlcnJvciIsImNvbnNvbGUiLCJsb2ciLCJnZXRUYWdzIiwidXBsb2FkZXIiLCJzb25nbmFtZSIsInBsYXlsaXN0TmFtZSIsImdldFRhZ3NVcmwiLCJ0YWdzU3RyaW5nIiwiVGFnRGF0YSIsImNvbnN0cnVjdG9yIiwidHlwZSIsImRhdGUiLCJEYXRlIiwidG9JU09TdHJpbmciLCJwb3NpdGlvbiIsIlRhZ0JveCIsIk1hcCIsIm1heFRhZ3MiLCJkaXZFbCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImlucHV0IiwiY2xhc3NMaXN0IiwiYWRkIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2dCIsInN0b3BQcm9wYWdhdGlvbiIsImlubmVySFRNTCIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRUYWdGcm9tVXNlciIsImJpbmQiLCJwYXJzZSIsInJlYnVpbGRUYWdzIiwiYWRkVGFncyIsImlzTmV3VGFnIiwiZm9yRWFjaCIsInZhbHVlIiwia2V5IiwiYWRkVGFnVG9Mb2NhbCIsInRhZ05hbWUiLCJoYXMiLCJzaXplIiwic2V0IiwiZSIsImlucHV0RWwiLCJ0YXJnZXQiLCJyZXBsYWNlIiwicmVtb3ZlVGFnIiwiZWxlbWVudCIsImRlbGV0ZSIsInJlbW92ZSIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJsaSIsInRhZyIsImFuY2hvclRhZyIsInJlbW92ZVRhZ0JvdW5kIiwiaW5zZXJ0QWRqYWNlbnRFbGVtZW50IiwicGFyc2VEYXRhIiwidGFnc1RvQWRkIiwiYXJ0aXN0Rm91bmQiLCJPU1RQbGF5bGlzdFJlZ2V4IiwiUmVnRXhwIiwidGVzdCIsImNsYXNzaWNzUGxheWxpc3RSZWdleCIsIm5pZ2h0Y29yZVJlZ2V4IiwidGFub2NSZWdleCIsInRvdWhvdVJlZ2V4IiwibWlrdVJlZ2V4Iiwia2FmdVJlZ2V4Iiwic2xhdmVSZWdleCIsImlhUmVnZXgiLCJnYW1lUmVnZXgiLCJnYW1lTWF0Y2giLCJtYXRjaCIsInRyaW0iLCJwZXJzb25hNVJlZ2V4IiwicGVyc29uYTVNYXRjaCIsInBlcnNvbmE0UmVnZXgiLCJwZXJzb25hNE1hdGNoIiwiZGFuZ2Fucm9ucGFSZWdleCIsImRhbmdhbnJvbnBhTWF0Y2giLCJob25rYWlSZWdleCIsImhvbmthaU1hdGNoIiwiYW5pbWVSZWdleCIsImFuaW1lTWF0Y2giLCJ0b3BpY1JlZ2V4Iiwic2xpY2UiLCJvZmZpY2lhbFJlZ2V4IiwicmVzdWx0Iiwic2xhc2hSZWdleCIsInVwbG9hZGVySW5Tb25nTmFtZVJlZ2V4Iiwi44Gh44KD44KT44Gt44KLSW5VcGxvYWRlck5hbWVSZWdleCIsImRhc2hSZWdleCIsImRlbGF5IiwidCIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsIndpbmRvdyIsIm9ubG9hZCIsImN1cnJlbnRVcmwiLCJsb2NhdGlvbiIsInBsYXlsaXN0UmVnZXgiLCJhZGRUYWdCb3hlc1RvUGxheWxpc3RJdGVtcyIsInBsYXlsaXN0U29uZ1JlZ2V4Iiwid2FpdEZvckVsZW1lbnQiLCJzZWxlY3RvciIsInJvb3RFbGVtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiY29uZmlnIiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsImdldEVsZW1lbnRCeUlkIiwiYWRkVGFnQm94ZXNUb1NvbmciLCJkaXNjb25uZWN0Iiwib2JzZXJ2ZSIsImRlc2NyaXB0aW9uQ2hhbmdlZCIsIm11dGF0aW9uc0xpc3QiLCJkZWxldGVUYWdCb3hlcyIsImRlc2NyaXB0aW9uT2JzZXJ2ZXIiLCJjaGFubmVsTmFtZUVsIiwic29uZ05hbWVFbCIsInBsYXlsaXN0TmFtZUVsIiwiaW5uZXJUZXh0IiwiYmVsb3dUaGVQbGF5ZXJFbCIsInRhZ0JveEVsIiwicGFyc2VIcmVmIiwiaW5zZXJ0QmVmb3JlIiwiZmlyc3RDaGlsZCIsImRpc3BsYXlEaWFsb2dFbCIsInNvbmdQYW5lcyIsInNvbmdQYW5lIiwic29uZ1BhbmVFbCIsImNvbnRlbnRFbCIsImNoaWxkcmVuIiwiY29udGFpbmVyRWwiLCJzdHlsZSIsImFsaWduSXRlbXMiLCJmbGV4V3JhcCIsInRodW1ibmFpbEVsIiwiYW5jaG9yRWwiLCJtZXRhRWwiLCJtZXRhRGF0YUVsIiwiY2hhbm5lbE5hbWVDb250YWluZXJFbCIsImFwcGVuZENoaWxkIiwidGFnQm94V3JhcHBlcnMiLCJyZWdleHAiXSwic291cmNlUm9vdCI6IiJ9