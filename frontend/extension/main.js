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
  static tagsResource = "https://songtagsbackend.herokuapp.com/tags/ajay/"; // static tagsResource: string = "http://127.0.0.1:8000/tags/ajay/"

  static async updateTagsForSong(href, tags) {
    const es6maptojson = JSON.stringify(Object.fromEntries(tags.entries()));
    return (await fetch(BackendNotifier.tagsResource + href, {
      method: 'POST',
      redirect: 'follow',
      mode: 'cors',
      body: es6maptojson
    }).then(response => {
      let responsetext = response.text();
      return responsetext;
    }).catch(error => console.log('error', error))) || '{}';
  }

  static async getStorageTags(href) {
    let getStorageTagsUrl = BackendNotifier.tagsResource + href;
    let tagsString = (await fetch(getStorageTagsUrl, {
      method: 'GET',
      redirect: 'follow',
      mode: 'cors'
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
      this.ul = document.createElement('ul');
      this.input = document.createElement('input');
    } else {
      this.divEl.classList.add("tagboxwrapper");
      this.divEl.addEventListener("click", evt => evt.stopPropagation()); // Or else we trigger youtubes click handler and enter the song

      this.divEl.innerHTML = `
            <div class = "tagbox">
                <ul> 
                <div class="text-input">
                <input type="text" id="` + href + `" placeholder="">
                <label for="` + href + `" class=taglabel>+</label>
                </div>
                </ul>
            </div>
            `;
      this.ul = this.divEl.querySelector("ul"), this.input = this.divEl.querySelector("input"), this.input.addEventListener("keyup", this.addTagFromUser.bind(this)); // We pull the tags that exist already from db
      // We add to this list from our hardcoded values

      _BackendNotifier__WEBPACK_IMPORTED_MODULE_0__.BackendNotifier.getStorageTags(this.href).then(tagsString => {
        let backendTags = new Map(Object.entries(JSON.parse(tagsString)));
        let automatedTags = this.parseData(songname, uploader, playlistName); // this.addTags(new Map([backendTags, ...automatedTags]));

        this.tags = backendTags;
        this.addTags(automatedTags);
        this.rebuildTags(); // needed for first runthrough
      });
    }
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
  } // We use this map to enable bulk updates instead of one by one whenever a change occurs
  // addTags(automatedTags: Map<string, TagData>, backendTags:Map<string, TagData>) {


  addTags(tags) {
    let isNewTag = false;
    tags.forEach((value, key) => {
      isNewTag = this.addTagToLocal(key, value.type);
    });

    if (isNewTag) {
      _BackendNotifier__WEBPACK_IMPORTED_MODULE_0__.BackendNotifier.updateTagsForSong(this.href, this.tags);
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
    _BackendNotifier__WEBPACK_IMPORTED_MODULE_0__.BackendNotifier.updateTagsForSong(this.href, this.tags);
  } // Rebuilds the tag box contents for the associated href


  rebuildTags() {
    this.ul.querySelectorAll("li").forEach(li => li.remove());
    this.tags.forEach((tag, key) => {
      let liTag = document.createElement('li');
      liTag.classList.add(tag.type);
      liTag.innerHTML = `${key}`; // let liTag = `<li>${tag} <i class="uit uit-multiply"></i></li>`; # if you need the X

      let removeTagBound = this.removeTag.bind(this);
      liTag.addEventListener('click', evt => removeTagBound(evt, key));
      this.ul.insertAdjacentElement("afterbegin", liTag);
    });
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
  console.log("Song Panes Loaded!", new Date().toISOString());
  delay(1000).then(() => {
    initializeTagBoxes();
  });
  startHrefObserver(window.location.href);
  return;
};
/*
async function main() {


    // Tried to obeserve the playlist items loading in but.. its a 50/50 on whether our code loads first or theirs!
    const playListElementsHolder = document.querySelector('div ytd-item-section-renderer');
    const observerOptions = {
        childList: true
    }
    const observer = new MutationObserver((mutations, observer) => {
        for (let mutation of mutations) {
            observer.disconnect();
            delay(500).then(() => { initializeTagBoxes(); })
        }
    }) 
    observer.observe(playListElementsHolder as Element, observerOptions);
    // // Pop up menu - need mutation observer
    // const popUpElement = document.querySelector('ytd-popup-container');
    // const observerOptions = {
    //     childList: true
    // }
    // const observer = new MutationObserver((mutations, observer) => {
    //     for (let mutation of mutations) {
    //         let addedNode = mutation.addedNodes[0];
    //         if(addedNode.localName !== "tp-yt-iron-dropdown") {
    //             continue;
    //         }
    //         delay(500).then(() => { popUpInitialized(addedNode); })
    //     }
    // }) 
    // observer.observe(popUpElement, observerOptions);
}
*/


function startHrefObserver(currenthref) {
  var bodyList = document.querySelector("body");
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (currenthref != window.location.href) {
        currenthref = window.location.href;
        console.log("Observer detected href change", new Date().toISOString());
        /* Changed ! your code here */

        delay(5000).then(() => {
          deleteTagBoxes();
          initializeTagBoxes();
        });
      }
    });
  });
  var config = {
    childList: true,
    subtree: true
  };
  observer.observe(bodyList, config);
}

function initializeTagBoxes() {
  console.log("Initializing Tag Boxes!", new Date().toISOString());
  const currentUrl = window.location.href;
  const playlistRegex = new RegExp('youtube\.com\/playlist\\?list=', 'i');
  if (playlistRegex.test(currentUrl)) addTagBoxesToPlaylistItems();
  const playlistSongRegex = new RegExp('youtube.com/watch\\?v=(.*)\&list=', 'i');
  if (playlistSongRegex.test(currentUrl)) addTagBoxesToPlaylistSong();
}

function deleteTagBoxes() {
  const tagBoxWrappers = document.querySelectorAll('.tagboxwrapper');

  for (const element of tagBoxWrappers) {
    element.remove();
  }
}

function addTagBoxesToPlaylistSong() {
  // primaryEl.querySelector("div.watch-active-metadata div:nth-child(2)")
  const descriptionHolderEl = document.querySelector("ytd-expander div");
  const channelNameEl = document.querySelector('yt-formatted-string[class*="ytd-channel-name"] a');
  const songNameEl = document.querySelector("div[id=\"container\"] h1 yt-formatted-string"); // The retrieved element has parent yt-* which has parent h3. The retrieved element also has attribute href which starts with /playlist

  const playlistNameEl = document.querySelector('h3 yt-formatted-string a[href^="/playlist"]');
  console.log(playlistNameEl.innerText, channelNameEl.innerText, songNameEl.innerText);
  const tagBoxEl = new _components_TagBox_TagBox__WEBPACK_IMPORTED_MODULE_0__.TagBox(parseHref(window.location.href), channelNameEl.innerText, songNameEl.innerText, playlistNameEl.innerText);
  descriptionHolderEl.appendChild(tagBoxEl.divEl);
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
    contentEl.appendChild(tagBoxEl.divEl);
  });
}

function parseHref(href) {
  const regexp = /watch\?v=(.*?)\&/i;
  const result = href.match(regexp);
  return result[1];
}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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UyxDQUFDYSxRQUFRLENBQUNqSyxJQUFWLENBQXBCLEVBQXFDK0ksYUFBYSxDQUFDRyxTQUFuRCxFQUE4REYsVUFBVSxDQUFDRSxTQUF6RSxFQUFvRkQsY0FBYyxDQUFDQyxTQUFuRyxDQUFqQjtJQUNBUSxTQUFTLENBQUNMLFdBQVYsQ0FBc0JGLFFBQVEsQ0FBQzlHLEtBQS9CO0VBQ0gsQ0EzQkQ7QUE0Qkg7O0FBR0QsU0FBUytHLFNBQVQsQ0FBbUJwSixJQUFuQixFQUFpQztFQUM3QixNQUFNcUssTUFBYyxHQUFHLG1CQUF2QjtFQUNBLE1BQU03RSxNQUF3QixHQUFHeEYsSUFBSSxDQUFDeUUsS0FBTCxDQUFXNEYsTUFBWCxDQUFqQztFQUNBLE9BQU83RSxNQUFNLENBQUMsQ0FBRCxDQUFiO0FBQ0gsQzs7Ozs7Ozs7Ozs7O0FDbEpELGlFQUFlLHFCQUF1QixpREFBaUQsRSIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL0JhY2tlbmROb3RpZmllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9UYWdCb3gvVGFnQm94LnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly8vLi9zcmMvQWRkVGFnQm94ZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvVGFnQWRkQnV0dG9uL1RhZ0FkZEJ1dHRvbi5zY3NzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRhZ0RhdGEgfSBmcm9tICcuL1RhZ0JveC9UYWdCb3gnXHJcblxyXG5leHBvcnQgY2xhc3MgQmFja2VuZE5vdGlmaWVyIHtcclxuICAgIHN0YXRpYyB0YWdzUmVzb3VyY2U6IHN0cmluZyA9IFwiaHR0cHM6Ly9zb25ndGFnc2JhY2tlbmQuaGVyb2t1YXBwLmNvbS90YWdzL2FqYXkvXCJcclxuICAgIC8vIHN0YXRpYyB0YWdzUmVzb3VyY2U6IHN0cmluZyA9IFwiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3RhZ3MvYWpheS9cIlxyXG5cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgdXBkYXRlVGFnc0ZvclNvbmcoaHJlZjogc3RyaW5nLCB0YWdzOiBNYXA8c3RyaW5nLCBUYWdEYXRhPikge1xyXG4gICAgICAgIGNvbnN0IGVzNm1hcHRvanNvbiA9IEpTT04uc3RyaW5naWZ5KE9iamVjdC5mcm9tRW50cmllcyh0YWdzLmVudHJpZXMoKSkpXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGZldGNoKEJhY2tlbmROb3RpZmllci50YWdzUmVzb3VyY2UraHJlZiwge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxyXG4gICAgICAgICAgICBtb2RlOiAnY29ycycgYXMgUmVxdWVzdE1vZGUsXHJcbiAgICAgICAgICAgIGJvZHk6IGVzNm1hcHRvanNvblxyXG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVzcG9uc2V0ZXh0ID0gcmVzcG9uc2UudGV4dCgpIFxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2V0ZXh0O1xyXG4gICAgICAgIH0pLmNhdGNoKGVycm9yID0+IGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKSkgfHwgJ3t9JztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0U3RvcmFnZVRhZ3MoaHJlZjogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGdldFN0b3JhZ2VUYWdzVXJsID0gQmFja2VuZE5vdGlmaWVyLnRhZ3NSZXNvdXJjZSArIGhyZWZcclxuICAgICAgICBsZXQgdGFnc1N0cmluZyA9IGF3YWl0IGZldGNoKGdldFN0b3JhZ2VUYWdzVXJsLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcclxuICAgICAgICAgICAgbW9kZTogJ2NvcnMnIGFzIFJlcXVlc3RNb2RlXHJcbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XHJcbiAgICAgICAgICAgIGxldCByZXNwb25zZXRleHQgPSByZXNwb25zZS50ZXh0KCkgXHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZXRleHRcclxuICAgICAgICB9KS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmxvZygnZXJyb3InLCBlcnJvcikpIHx8ICd7fSc7XHJcbiAgICAgICAgcmV0dXJuIHRhZ3NTdHJpbmc7XHJcbiAgICB9XHJcblxyXG59XHJcbiIsImltcG9ydCB7IEJhY2tlbmROb3RpZmllciB9IGZyb20gJy4uL0JhY2tlbmROb3RpZmllcic7XG5cblxuZXhwb3J0IGNsYXNzIFRhZ0RhdGEge1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBkYXRlOiBzdHJpbmc7XG4gICAgcG9zaXRpb246IG51bWJlcjtcbiAgICBjb25zdHJ1Y3RvciAodHlwZTogc3RyaW5nID0gXCJkZWZhdWx0XCIsIGRhdGU6IHN0cmluZyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSkge1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmRhdGUgPSBkYXRlO1xuICAgICAgICBpZih0eXBlID09IFwiYXJ0aXN0XCIpIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSA1MDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwidXBsb2FkZXJcIikge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IDEwMDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiZGVmYXVsdFwiKSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gOTk5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IDE1MDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gZXhwb3J0IGNsYXNzIFRhZzIge1xuLy8gICAgIG5hbWU6IHN0cmluZztcbi8vICAgICB0eXBlOiBzdHJpbmc7XG4vLyAgICAgZGF0ZTogc3RyaW5nO1xuLy8gICAgIGNvbnN0cnVjdG9yIChuYW1lOiBzdHJpbmcsIHR5cGU6IHN0cmluZyA9IFwiZGVmYXVsdFwiLCBkYXRlOiBzdHJpbmcgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpIHtcbi8vICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbi8vICAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbi8vICAgICAgICAgdGhpcy5kYXRlID0gZGF0ZTtcbi8vICAgICB9XG4vLyB9XG5cbmV4cG9ydCBjbGFzcyBUYWdCb3gge1xuICAgIHBsYXlsaXN0TmFtZTogc3RyaW5nO1xuICAgIGhyZWY6IHN0cmluZztcblxuICAgIGRpdkVsOiBFbGVtZW50O1xuICAgIHVsOiBIVE1MVUxpc3RFbGVtZW50O1xuICAgIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50O1xuXG4gICAgbWF4VGFnczogbnVtYmVyO1xuICAgIHRhZ3M6IE1hcDxzdHJpbmcsIFRhZ0RhdGE+O1xuXG5cbiAgICBjb25zdHJ1Y3RvcihocmVmOiBzdHJpbmcsIHVwbG9hZGVyOiBzdHJpbmcsIHNvbmduYW1lOiBzdHJpbmcsIHBsYXlsaXN0TmFtZTogc3RyaW5nKSB7XG4gICAgICAgIC8vIHRoaXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgLy8gbGV0IHRhZ0JveERpdjogRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuICAgICAgICB0aGlzLnBsYXlsaXN0TmFtZSA9IHBsYXlsaXN0TmFtZTtcbiAgICAgICAgdGhpcy5ocmVmID0gaHJlZjsgXG4gICAgICAgIHRoaXMudGFncyA9IG5ldyBNYXA8c3RyaW5nLCBUYWdEYXRhPigpO1xuICAgICAgICB0aGlzLm1heFRhZ3MgPSAxMCxcblxuICAgICAgICB0aGlzLmRpdkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJyk7XG4gICAgICAgIGlmKHBsYXlsaXN0TmFtZSA9PT0gXCJXYXRjaCBsYXRlclwiKSB7XG4gICAgICAgICAgICB0aGlzLnVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKSBhcyBIVE1MVUxpc3RFbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRpdkVsLmNsYXNzTGlzdC5hZGQoXCJ0YWdib3h3cmFwcGVyXCIpO1xuICAgICAgICAgICAgdGhpcy5kaXZFbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2dDogYW55KSA9PiBldnQuc3RvcFByb3BhZ2F0aW9uKCkpOyAvLyBPciBlbHNlIHdlIHRyaWdnZXIgeW91dHViZXMgY2xpY2sgaGFuZGxlciBhbmQgZW50ZXIgdGhlIHNvbmdcbiAgICAgICAgICAgIHRoaXMuZGl2RWwuaW5uZXJIVE1MID1cbiAgICAgICAgICAgIGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3MgPSBcInRhZ2JveFwiPlxuICAgICAgICAgICAgICAgIDx1bD4gXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtaW5wdXRcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cImAgKyBocmVmICsgYFwiIHBsYWNlaG9sZGVyPVwiXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImAgKyBocmVmICsgYFwiIGNsYXNzPXRhZ2xhYmVsPis8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIGBcbiAgICAgICAgICAgIHRoaXMudWwgPSB0aGlzLmRpdkVsLnF1ZXJ5U2VsZWN0b3IoXCJ1bFwiKSBhcyBIVE1MVUxpc3RFbGVtZW50LFxuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IHRoaXMuZGl2RWwucXVlcnlTZWxlY3RvcihcImlucHV0XCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXG4gICAgICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCB0aGlzLmFkZFRhZ0Zyb21Vc2VyLmJpbmQodGhpcykpO1xuXG5cblxuICAgICAgICAgICAgLy8gV2UgcHVsbCB0aGUgdGFncyB0aGF0IGV4aXN0IGFscmVhZHkgZnJvbSBkYlxuICAgICAgICAgICAgLy8gV2UgYWRkIHRvIHRoaXMgbGlzdCBmcm9tIG91ciBoYXJkY29kZWQgdmFsdWVzXG4gICAgICAgICAgICBCYWNrZW5kTm90aWZpZXIuZ2V0U3RvcmFnZVRhZ3ModGhpcy5ocmVmKS50aGVuKHRhZ3NTdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBiYWNrZW5kVGFnczogTWFwPHN0cmluZywgVGFnRGF0YT4gPSBuZXcgTWFwKE9iamVjdC5lbnRyaWVzKEpTT04ucGFyc2UodGFnc1N0cmluZykpKTtcbiAgICAgICAgICAgICAgICBsZXQgYXV0b21hdGVkVGFnczogTWFwPHN0cmluZywgVGFnRGF0YT4gPSB0aGlzLnBhcnNlRGF0YShzb25nbmFtZSwgdXBsb2FkZXIsIHBsYXlsaXN0TmFtZSlcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmFkZFRhZ3MobmV3IE1hcChbYmFja2VuZFRhZ3MsIC4uLmF1dG9tYXRlZFRhZ3NdKSk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzID0gYmFja2VuZFRhZ3M7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRUYWdzKGF1dG9tYXRlZFRhZ3MpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVidWlsZFRhZ3MoKTsgICAgICAgICAgICAgLy8gbmVlZGVkIGZvciBmaXJzdCBydW50aHJvdWdoXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwYXJzZURhdGEoc29uZ25hbWU6IHN0cmluZywgdXBsb2FkZXI6IHN0cmluZywgcGxheWxpc3ROYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHRhZ3NUb0FkZCA9IG5ldyBNYXA8c3RyaW5nLCBUYWdEYXRhPigpO1xuICAgICAgICBsZXQgYXJ0aXN0Rm91bmQ6IGJvb2xlYW4gPSBmYWxzZTsgXG4gICAgICAgIFxuICAgICAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgUmVnZXggdG8gcGFyc2UgcGxheWxpc3QgbmFtZSAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8gIFxuICAgICAgICBjb25zdCBPU1RQbGF5bGlzdFJlZ2V4ID0gbmV3IFJlZ0V4cCgnR2FtZS9UVi9Nb3ZpZSBPU1QnKVxuICAgICAgICBpZiAoT1NUUGxheWxpc3RSZWdleC50ZXN0KHBsYXlsaXN0TmFtZSkpIHRhZ3NUb0FkZC5zZXQoXCJPU1RcIiwgbmV3IFRhZ0RhdGEoXCJjYXRlZ29yeVwiKSk7XG5cbiAgICAgICAgY29uc3QgY2xhc3NpY3NQbGF5bGlzdFJlZ2V4ID0gbmV3IFJlZ0V4cCgnXkNsYXNzaWNzJCcpXG4gICAgICAgIGlmIChjbGFzc2ljc1BsYXlsaXN0UmVnZXgudGVzdChwbGF5bGlzdE5hbWUpKSB0YWdzVG9BZGQuc2V0KFwi4ZuE4ZuE4ZuE4ZuE4ZuEXCIsIG5ldyBUYWdEYXRhKFwiR09BVFwiKSk7XG5cbiAgICAgICAgdGFnc1RvQWRkLnNldChcIklOUExBWUxJU1RcIiwgbmV3IFRhZ0RhdGEgKFwibWV0YWRhdGFcIikpO1xuXG4gICAgICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgICAqICAgICAgIFJlZ2V4IHRvIHBhcnNlIHNvbmcgbmFtZSBhbmQgZ2V0IGV4dHJhIGluZm9ybWF0aW9uICAgICAgICAqXG4gICAgICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLyAgXG4gICAgICAgIC8qIFJlZ2V4IHRvIHBhcnNlIHNvbmcgbmFtZSBhbmQgZ2V0IGV4dHJhIGluZm9ybWF0aW9uKi9cbiAgICAgICAgY29uc3QgbmlnaHRjb3JlUmVnZXggPSBuZXcgUmVnRXhwKCduaWdodGNvcmUnLCAnaScpXG4gICAgICAgIGlmIChuaWdodGNvcmVSZWdleC50ZXN0KHNvbmduYW1lKSkgdGFnc1RvQWRkLnNldChcIk5pZ2h0Y29yZVwiLCBuZXcgVGFnRGF0YShcImNhdGVnb3J5XCIpKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHRhbm9jUmVnZXggPSBuZXcgUmVnRXhwKCd1c2FvfGRqIG5vcmlrZW58a28zfE1hc3NpdmUgTmV3IEtyZXd8UkVEQUxpQ0V8TGF1cnxrb3JzIGt8U3JhdjNSfGFyYW58SG9tbWFyanV8REogR2Vua2l8REogTXlvc3VrZXx0XFxcXCtwYXpvbGl0ZXxSb3VnaFNrZXRjaHxLb2JhcnlvfFBcXFxcKkxpZ2h0fG5vcmEycnxSZWxlY3R8R2V0dHl8VGF0c3Vub3NoaW4nLCAnaScpXG4gICAgICAgIGlmICh0YW5vY1JlZ2V4LnRlc3Qoc29uZ25hbWUpKSB0YWdzVG9BZGQuc2V0KFwiVEFOTypDXCIsIG5ldyBUYWdEYXRhKFwiY2F0ZWdvcnlcIikpO1xuXG4gICAgICAgIGNvbnN0IHRvdWhvdVJlZ2V4ID0gbmV3IFJlZ0V4cCgn5p2x5pa5fFRvdWhvdScsICdpJylcbiAgICAgICAgaWYgKHRvdWhvdVJlZ2V4LnRlc3Qoc29uZ25hbWUpKSB0YWdzVG9BZGQuc2V0KFwi5p2x5pa5XCIsIG5ldyBUYWdEYXRhKFwiY2F0ZWdvcnlcIikpXG5cbiAgICAgICAgLyogVm9jYWxvaWQgKi9cbiAgICAgICAgY29uc3QgbWlrdVJlZ2V4ID0gbmV3IFJlZ0V4cCgnTWlrdXzjg5/jgq8nLCAnaScpXG4gICAgICAgIGlmIChtaWt1UmVnZXgudGVzdChzb25nbmFtZSkpIHRhZ3NUb0FkZC5zZXQoXCLjg5/jgq9cIiwgbmV3IFRhZ0RhdGEoXCJ2b2NhbG9pZFwiKSk7XG5cbiAgICAgICAgY29uc3Qga2FmdVJlZ2V4ID0gbmV3IFJlZ0V4cCgnS2FmdXzlj6/kuI0nLCAnaScpXG4gICAgICAgIGlmIChrYWZ1UmVnZXgudGVzdChzb25nbmFtZSkpIHRhZ3NUb0FkZC5zZXQoXCLlj6/kuI1cIiwgbmV3IFRhZ0RhdGEoXCJ2b2NhbG9pZFwiKSk7XG5cbiAgICAgICAgY29uc3Qgc2xhdmVSZWdleCA9IG5ldyBSZWdFeHAoJ1NsYXZlXFwuVi1WLVInLCAnaScpXG4gICAgICAgIGlmIChzbGF2ZVJlZ2V4LnRlc3Qoc29uZ25hbWUpKSB0YWdzVG9BZGQuc2V0KFwiU2xhdmUuVi1WLVJcIiwgbmV3IFRhZ0RhdGEoXCJ2b2NhbG9pZFwiKSk7XG5cbiAgICAgICAgY29uc3QgaWFSZWdleCA9IG5ldyBSZWdFeHAoJyBJQScpXG4gICAgICAgIGlmIChpYVJlZ2V4LnRlc3Qoc29uZ25hbWUpKSB0YWdzVG9BZGQuc2V0KFwiSUFcIiwgbmV3IFRhZ0RhdGEoXCJ2b2NhbG9pZFwiKSk7XG5cblxuICAgICAgICAvKiBHYW1lIGFuZCBBbmltZSAqL1xuICAgICAgICBjb25zdCBnYW1lUmVnZXggPSBuZXcgUmVnRXhwKCcoQmx1ZSBBcmNoaXZlfENvdW50ZXJzaWRlfExvc3QgQXJrfEFya25pZ2h0cyknLCAnaScpXG4gICAgICAgIGNvbnN0IGdhbWVNYXRjaCA9IHNvbmduYW1lLm1hdGNoKGdhbWVSZWdleClcbiAgICAgICAgaWYgKGdhbWVNYXRjaCkge3RhZ3NUb0FkZC5zZXQoZ2FtZU1hdGNoWzFdLnRyaW0oKSwgbmV3IFRhZ0RhdGEoXCJnYW1lXCIpKTsgYXJ0aXN0Rm91bmQgPSB0cnVlO31cblxuICAgICAgICBjb25zdCBwZXJzb25hNVJlZ2V4ID0gbmV3IFJlZ0V4cCgnKFA1fFA1UnxQZXJzb25hIDUpJylcbiAgICAgICAgY29uc3QgcGVyc29uYTVNYXRjaCA9IHNvbmduYW1lLm1hdGNoKHBlcnNvbmE1UmVnZXgpO1xuICAgICAgICBpZiAocGVyc29uYTVNYXRjaCkgeyB0YWdzVG9BZGQuc2V0KFwiUGVyc29uYSA1XCIsIG5ldyBUYWdEYXRhKFwiZ2FtZVwiKSk7IGFydGlzdEZvdW5kID0gdHJ1ZTt9XG4gICAgICAgIGNvbnN0IHBlcnNvbmE0UmVnZXggPSBuZXcgUmVnRXhwKCcoUDR8UDRHfFBlcnNvbmEgNCknKVxuICAgICAgICBjb25zdCBwZXJzb25hNE1hdGNoID0gc29uZ25hbWUubWF0Y2gocGVyc29uYTRSZWdleCk7XG4gICAgICAgIGlmIChwZXJzb25hNE1hdGNoKSB7dGFnc1RvQWRkLnNldChcIlBlcnNvbmEgNFwiLCBuZXcgVGFnRGF0YShcImdhbWVcIikpOyBhcnRpc3RGb3VuZCA9IHRydWU7fVxuXG4gICAgICAgIGNvbnN0IGRhbmdhbnJvbnBhUmVnZXggPSBuZXcgUmVnRXhwKCcoRGFuZ2Fucm9ucGF8RGFuZ2Fucm9ucGEgMnxTRFIyfERhbmdhbnJvbnBhIFYzfERhbmdhbnJvbnBhIDMpJylcbiAgICAgICAgY29uc3QgZGFuZ2Fucm9ucGFNYXRjaCA9IHNvbmduYW1lLm1hdGNoKGRhbmdhbnJvbnBhUmVnZXgpO1xuICAgICAgICBpZiAoZGFuZ2Fucm9ucGFNYXRjaCkge3RhZ3NUb0FkZC5zZXQoXCJEYW5nYW5yb25wYVwiLCBuZXcgVGFnRGF0YShcImdhbWVcIikpOyBhcnRpc3RGb3VuZCA9IHRydWU7fVxuXG4gICAgICAgIGNvbnN0IGhvbmthaVJlZ2V4ID0gbmV3IFJlZ0V4cCgnKEhJM3xIb25rYWkgSW1wYWN0IDN8SG91a2FpIEltcGFjdCAzKScpXG4gICAgICAgIGNvbnN0IGhvbmthaU1hdGNoID0gc29uZ25hbWUubWF0Y2goaG9ua2FpUmVnZXgpO1xuICAgICAgICBpZiAoaG9ua2FpTWF0Y2gpIHt0YWdzVG9BZGQuc2V0KFwiSG9ua2FpIEltcGFjdCAzcmRcIiwgbmV3IFRhZ0RhdGEoXCJnYW1lXCIpKTsgYXJ0aXN0Rm91bmQgPSB0cnVlO31cblxuICAgICAgICBjb25zdCBhbmltZVJlZ2V4ID0gbmV3IFJlZ0V4cCgnKEJsZWFjaHxHaW50YW1hfExpbmsgQ2xpY2spJywgJ2knKVxuICAgICAgICBjb25zdCBhbmltZU1hdGNoID0gc29uZ25hbWUubWF0Y2goYW5pbWVSZWdleClcbiAgICAgICAgaWYgKGFuaW1lTWF0Y2gpIHt0YWdzVG9BZGQuc2V0KGFuaW1lTWF0Y2hbMV0udHJpbSgpLCBuZXcgVGFnRGF0YShcImFuaW1lXCIpKTsgYXJ0aXN0Rm91bmQgPSB0cnVlO31cbiAgICAgICAgXG5cblxuXG4gICAgICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgICAqICAgICAgUmVnZXggdG8gcGFyc2UgdXBsb2FkZXIgbmFtZSAoYW5kIHRyeSB0byBmaW5kIGFydGlzdCkgICAgICAqXG4gICAgICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLyAgXG4gICAgICAgIC8vIENhc2UgMCAtIEFydGlzdCBhbHJlYWR5IGZvdWluZCBcbiAgICAgICAgIGlmKGFydGlzdEZvdW5kKSByZXR1cm4gdGFnc1RvQWRkOyBcblxuICAgICAgICAvLyBDYXNlIDEgLSBGb3VuZCBhcnRpc3QgdGhyb3VnaCB0b3BpY1xuICAgICAgICBjb25zdCB0b3BpY1JlZ2V4ID0gbmV3IFJlZ0V4cCgnIC0gVG9waWMnLCAnaScpXG4gICAgICAgIGlmICh0b3BpY1JlZ2V4LnRlc3QodXBsb2FkZXIpKSB7XG4gICAgICAgICAgICB0YWdzVG9BZGQuc2V0KHVwbG9hZGVyLnNsaWNlKDAsIC04KSwgbmV3IFRhZ0RhdGEoXCJhcnRpc3RcIikpO1xuICAgICAgICAgICAgcmV0dXJuIHRhZ3NUb0FkZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhc2UgMiAtIEZvdW5kIGFydGlzdCBieSByZW1vdmluZyBPZmZpY2lhbFxuICAgICAgICBjb25zdCBvZmZpY2lhbFJlZ2V4ID0gbmV3IFJlZ0V4cCgnKC4qPykgT2ZmaWNpYWwnLCAnaScpXG4gICAgICAgIHJlc3VsdCA9IHVwbG9hZGVyLm1hdGNoKG9mZmljaWFsUmVnZXgpIGFzIFJlZ0V4cE1hdGNoQXJyYXk7XG4gICAgICAgIGlmKHJlc3VsdCl7XG4gICAgICAgICAgICB0YWdzVG9BZGQuc2V0KHJlc3VsdFsxXSwgbmV3IFRhZ0RhdGEoXCJhcnRpc3RcIikpXG4gICAgICAgICAgICByZXR1cm4gdGFnc1RvQWRkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FzZSAzIC0gRm91bmQgYXJ0aXN0IGJ5IHJlbW92aW5nIFxcXG4gICAgICAgIGNvbnN0IHNsYXNoUmVnZXggPSBuZXcgUmVnRXhwKCcoLio/KSBcXC8nKVxuICAgICAgICB2YXIgcmVzdWx0OiBSZWdFeHBNYXRjaEFycmF5ID0gdXBsb2FkZXIubWF0Y2goc2xhc2hSZWdleCkgYXMgUmVnRXhwTWF0Y2hBcnJheTtcbiAgICAgICAgaWYocmVzdWx0KSB7XG4gICAgICAgICAgICB0YWdzVG9BZGQuc2V0KHJlc3VsdFsxXSwgbmV3IFRhZ0RhdGEoXCJhcnRpc3RcIikpXG4gICAgICAgICAgICByZXR1cm4gdGFnc1RvQWRkO1xuICAgICAgICB9XG4gXG4gICAgICAgIC8vIENhc2UgNCAtIEZvdW5kIGFydGlzdCBhcyB1cGxvYWRlciBuYW1lICBleGlzdHMgaW4gc29uZyBuYW1lIFxuICAgICAgICBjb25zdCB1cGxvYWRlckluU29uZ05hbWVSZWdleCA9IG5ldyBSZWdFeHAodXBsb2FkZXIsICdpJylcbiAgICAgICAgaWYgKHVwbG9hZGVySW5Tb25nTmFtZVJlZ2V4LnRlc3Qoc29uZ25hbWUpKSB7XG4gICAgICAgICAgICB0YWdzVG9BZGQuc2V0KHVwbG9hZGVyLCBuZXcgVGFnRGF0YShcImFydGlzdFwiKSk7XG4gICAgICAgICAgICByZXR1cm4gdGFnc1RvQWRkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FzZSA1IC0gRm91bmQgYXJ0aXN0IHRoYXQgaGFzIOOBvuOBteOBvuOBteOBoeOCg+OCk+OBreOCi1xuICAgICAgICBjb25zdCDjgaHjgoPjgpPjga3jgotJblVwbG9hZGVyTmFtZVJlZ2V4ID0gbmV3IFJlZ0V4cCgnKC4qPynjgaHjgoPjgpPjga3jgosnLCAnaScpXG4gICAgICAgIHZhciByZXN1bHQ6IFJlZ0V4cE1hdGNoQXJyYXkgPSB1cGxvYWRlci5tYXRjaCjjgaHjgoPjgpPjga3jgotJblVwbG9hZGVyTmFtZVJlZ2V4KSBhcyBSZWdFeHBNYXRjaEFycmF5O1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICB0YWdzVG9BZGQuc2V0KHJlc3VsdFsxXSwgbmV3IFRhZ0RhdGEoXCJhcnRpc3RcIikpO1xuICAgICAgICAgICAgcmV0dXJuIHRhZ3NUb0FkZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhc2UgNiAtIEZvdW5kIGFydGlzdCB0aGF0IGhhcyBmZWF0LiBpbiB0aXRsZVxuXG4gICAgICAgIC8vIENhc2UgOTk3IC0gS01OWiB4IEVYQU1QTEUgaXMgaW4gdGl0bGUsIHVwbG9hZGVyIGlzIEtNTlogTElUQVxuXG4gICAgICAgIC8vIENhc2UgNDk5XG5cbiAgICAgICAgLy8gQ2FzZSA5OTggLSBEZWxpbWl0IG9uICctJyBsbWFvLi5cbiAgICAgICAgY29uc3QgZGFzaFJlZ2V4ID0gbmV3IFJlZ0V4cCgnKC4qPykgLS4qJylcbiAgICAgICAgdmFyIHJlc3VsdDogUmVnRXhwTWF0Y2hBcnJheSA9IHNvbmduYW1lLm1hdGNoKGRhc2hSZWdleCkgYXMgUmVnRXhwTWF0Y2hBcnJheTtcbiAgICAgICAgaWYocmVzdWx0KSB7XG4gICAgICAgICAgICB0YWdzVG9BZGQuc2V0KHJlc3VsdFsxXSwgbmV3IFRhZ0RhdGEoXCJhcnRpc3RcIikpXG4gICAgICAgICAgICByZXR1cm4gdGFnc1RvQWRkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FzZSA5OTkgLSBSZXR1cm4gdXBsb2FkZXIgb25seS4uIGFydGlzdCBub3QgZm91bmRcbiAgICAgICAgdGFnc1RvQWRkLnNldCh1cGxvYWRlciwgbmV3IFRhZ0RhdGEoXCJ1cGxvYWRlclwiKSk7XG4gICAgICAgIHJldHVybiB0YWdzVG9BZGQ7XG4gICAgfVxuXG5cblxuXG4gICAgLy8gV2UgdXNlIHRoaXMgbWFwIHRvIGVuYWJsZSBidWxrIHVwZGF0ZXMgaW5zdGVhZCBvZiBvbmUgYnkgb25lIHdoZW5ldmVyIGEgY2hhbmdlIG9jY3Vyc1xuICAgIC8vIGFkZFRhZ3MoYXV0b21hdGVkVGFnczogTWFwPHN0cmluZywgVGFnRGF0YT4sIGJhY2tlbmRUYWdzOk1hcDxzdHJpbmcsIFRhZ0RhdGE+KSB7XG4gICAgYWRkVGFncyh0YWdzOiBNYXA8c3RyaW5nLCBUYWdEYXRhPikge1xuICAgICAgICBsZXQgaXNOZXdUYWcgPSBmYWxzZTtcbiAgICAgICAgdGFncy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpc05ld1RhZyA9IHRoaXMuYWRkVGFnVG9Mb2NhbChrZXksIHZhbHVlLnR5cGUpO1xuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgaWYoaXNOZXdUYWcpIHsgXG4gICAgICAgICAgICBCYWNrZW5kTm90aWZpZXIudXBkYXRlVGFnc0ZvclNvbmcodGhpcy5ocmVmLCB0aGlzLnRhZ3MpOyBcbiAgICAgICAgICAgIHRoaXMucmVidWlsZFRhZ3MoKTsgICBcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5lZWQgdG8gZG8gdGhpcyBmb3IgZmlyc3QgdGltZSBvbmx5IHRvIGNyZWF0ZSB0YWdzIG9uIGZyb250ZW5kXG4gICAgfVxuXG4gICAgYWRkVGFnVG9Mb2NhbCh0YWdOYW1lOiBzdHJpbmcsIHR5cGU6IHN0cmluZyA9IFwiZGVmYXVsdFwiKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIENhbiBoYXZlIHVwIHRvIDEwIHRhZ3MuIE5vIGR1cGxpY2F0ZXMuIE1pbmltdW0gbGVuZ3RoID0gMVxuICAgICAgICBsZXQgaXNOZXdUYWcgPSBmYWxzZTtcbiAgICAgICAgaWYoIXRoaXMudGFncy5oYXModGFnTmFtZSkpe1xuICAgICAgICAgICAgaXNOZXdUYWcgPSB0cnVlO1xuICAgICAgICAgICAgaWYodGhpcy50YWdzLnNpemUgPj0gMTApIHJldHVybiBmYWxzZTsgXG4gICAgICAgICAgICB0aGlzLnRhZ3Muc2V0KHRhZ05hbWUsIG5ldyBUYWdEYXRhKHR5cGUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNOZXdUYWc7XG4gICAgfVxuXG4gICAgLy8gUmVhZHMgaW5wdXQgZmllbGQgYW5kIGFkZHMgdGhlIHRhZ1xuICAgIGFkZFRhZ0Zyb21Vc2VyKGU6S2V5Ym9hcmRFdmVudCl7XG4gICAgICAgIGlmIChlLmtleSAhPT0gJ0VudGVyJykgcmV0dXJuO1xuICAgICAgICBsZXQgaW5wdXRFbCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgIGxldCB0YWdOYW1lID0gaW5wdXRFbC52YWx1ZS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG5cbiAgICAgICAgdGhpcy5hZGRUYWdzKG5ldyBNYXA8c3RyaW5nLCBUYWdEYXRhPihbW3RhZ05hbWUsIG5ldyBUYWdEYXRhKFwiZGVmYXVsdFwiKV1dKSk7XG4gICAgICAgIGlucHV0RWwudmFsdWUgPSBcIlwiO1xuICAgIH1cblxuXG4gICAgcmVtb3ZlVGFnKGV2dDpNb3VzZUV2ZW50LCB0YWdOYW1lOiBzdHJpbmcpe1xuICAgICAgICBsZXQgZWxlbWVudCA9IGV2dC50YXJnZXQgYXMgRWxlbWVudDtcbiAgICAgICAgY29uc29sZS5sb2coJ1JlbW92aW5nIHRhZyBlbGVtZW50OicsIGVsZW1lbnQpO1xuICAgICAgICBpZighZWxlbWVudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnRhZ3MuZGVsZXRlKHRhZ05hbWUpXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIEJhY2tlbmROb3RpZmllci51cGRhdGVUYWdzRm9yU29uZyh0aGlzLmhyZWYsIHRoaXMudGFncyk7XG4gICAgfVxuXG4gICAgLy8gUmVidWlsZHMgdGhlIHRhZyBib3ggY29udGVudHMgZm9yIHRoZSBhc3NvY2lhdGVkIGhyZWZcbiAgICByZWJ1aWxkVGFncygpe1xuICAgICAgICB0aGlzLnVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaVwiKS5mb3JFYWNoKGxpID0+IGxpLnJlbW92ZSgpKTtcbiAgICAgICAgdGhpcy50YWdzLmZvckVhY2goKHRhZywga2V5KSA9PiB7XG4gICAgICAgICAgICBsZXQgbGlUYWc6IEhUTUxMSUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgbGlUYWcuY2xhc3NMaXN0LmFkZCh0YWcudHlwZSlcbiAgICAgICAgICAgIGxpVGFnLmlubmVySFRNTCA9IGAke2tleX1gXG4gICAgICAgICAgICAvLyBsZXQgbGlUYWcgPSBgPGxpPiR7dGFnfSA8aSBjbGFzcz1cInVpdCB1aXQtbXVsdGlwbHlcIj48L2k+PC9saT5gOyAjIGlmIHlvdSBuZWVkIHRoZSBYXG4gICAgICAgICAgICBsZXQgcmVtb3ZlVGFnQm91bmQgPSB0aGlzLnJlbW92ZVRhZy5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgbGlUYWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZ0KSA9PiByZW1vdmVUYWdCb3VuZChldnQsa2V5KSk7XG4gICAgICAgICAgICB0aGlzLnVsLmluc2VydEFkamFjZW50RWxlbWVudChcImFmdGVyYmVnaW5cIiwgbGlUYWcpO1xuICAgICAgICB9KVxuICAgIH1cbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjsiLCJpbXBvcnQgeyBUYWdCb3ggfSBmcm9tICcuL2NvbXBvbmVudHMvVGFnQm94L1RhZ0JveCc7XG5cbmNvbnN0IGRlbGF5ID0gKHQ6bnVtYmVyKSA9PiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdCkpO1xuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiU29uZyBQYW5lcyBMb2FkZWQhXCIsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XG4gICAgZGVsYXkoMTAwMCkudGhlbigoKSA9PiB7IGluaXRpYWxpemVUYWdCb3hlcygpOyB9KVxuICAgIHN0YXJ0SHJlZk9ic2VydmVyKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgICByZXR1cm47XG59IFxuXG4vKlxuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcblxuXG4gICAgLy8gVHJpZWQgdG8gb2Jlc2VydmUgdGhlIHBsYXlsaXN0IGl0ZW1zIGxvYWRpbmcgaW4gYnV0Li4gaXRzIGEgNTAvNTAgb24gd2hldGhlciBvdXIgY29kZSBsb2FkcyBmaXJzdCBvciB0aGVpcnMhXG4gICAgY29uc3QgcGxheUxpc3RFbGVtZW50c0hvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2RpdiB5dGQtaXRlbS1zZWN0aW9uLXJlbmRlcmVyJyk7XG4gICAgY29uc3Qgb2JzZXJ2ZXJPcHRpb25zID0ge1xuICAgICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICB9XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zLCBvYnNlcnZlcikgPT4ge1xuICAgICAgICBmb3IgKGxldCBtdXRhdGlvbiBvZiBtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIGRlbGF5KDUwMCkudGhlbigoKSA9PiB7IGluaXRpYWxpemVUYWdCb3hlcygpOyB9KVxuICAgICAgICB9XG4gICAgfSkgXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShwbGF5TGlzdEVsZW1lbnRzSG9sZGVyIGFzIEVsZW1lbnQsIG9ic2VydmVyT3B0aW9ucyk7XG4gICAgLy8gLy8gUG9wIHVwIG1lbnUgLSBuZWVkIG11dGF0aW9uIG9ic2VydmVyXG4gICAgLy8gY29uc3QgcG9wVXBFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigneXRkLXBvcHVwLWNvbnRhaW5lcicpO1xuICAgIC8vIGNvbnN0IG9ic2VydmVyT3B0aW9ucyA9IHtcbiAgICAvLyAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgLy8gfVxuICAgIC8vIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucywgb2JzZXJ2ZXIpID0+IHtcbiAgICAvLyAgICAgZm9yIChsZXQgbXV0YXRpb24gb2YgbXV0YXRpb25zKSB7XG4gICAgLy8gICAgICAgICBsZXQgYWRkZWROb2RlID0gbXV0YXRpb24uYWRkZWROb2Rlc1swXTtcbiAgICAvLyAgICAgICAgIGlmKGFkZGVkTm9kZS5sb2NhbE5hbWUgIT09IFwidHAteXQtaXJvbi1kcm9wZG93blwiKSB7XG4gICAgLy8gICAgICAgICAgICAgY29udGludWU7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgICBkZWxheSg1MDApLnRoZW4oKCkgPT4geyBwb3BVcEluaXRpYWxpemVkKGFkZGVkTm9kZSk7IH0pXG4gICAgLy8gICAgIH1cbiAgICAvLyB9KSBcbiAgICAvLyBvYnNlcnZlci5vYnNlcnZlKHBvcFVwRWxlbWVudCwgb2JzZXJ2ZXJPcHRpb25zKTtcbn1cbiovXG5cbmZ1bmN0aW9uIHN0YXJ0SHJlZk9ic2VydmVyKGN1cnJlbnRocmVmOiBzdHJpbmcpIHtcbiAgICB2YXIgYm9keUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKSBhcyBIVE1MQm9keUVsZW1lbnQ7XG5cbiAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihtdXRhdGlvbnMpIHtcbiAgICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24obXV0YXRpb24pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50aHJlZiAhPSB3aW5kb3cubG9jYXRpb24uaHJlZikge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRocmVmID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJPYnNlcnZlciBkZXRlY3RlZCBocmVmIGNoYW5nZVwiLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIC8qIENoYW5nZWQgISB5b3VyIGNvZGUgaGVyZSAqL1xuICAgICAgICAgICAgICAgIGRlbGF5KDUwMDApLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGVUYWdCb3hlcygpO1xuICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplVGFnQm94ZXMoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgIHN1YnRyZWU6IHRydWVcbiAgICB9O1xuICAgIFxuICAgIG9ic2VydmVyLm9ic2VydmUoYm9keUxpc3QsIGNvbmZpZyk7XG59XG5cbmZ1bmN0aW9uIGluaXRpYWxpemVUYWdCb3hlcygpIHtcbiAgICBjb25zb2xlLmxvZyhcIkluaXRpYWxpemluZyBUYWcgQm94ZXMhXCIsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSlcbiAgICBjb25zdCBjdXJyZW50VXJsOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICAgIGNvbnN0IHBsYXlsaXN0UmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoJ3lvdXR1YmVcXC5jb21cXC9wbGF5bGlzdFxcXFw/bGlzdD0nLCAnaScpXG4gICAgaWYgKHBsYXlsaXN0UmVnZXgudGVzdChjdXJyZW50VXJsKSkgYWRkVGFnQm94ZXNUb1BsYXlsaXN0SXRlbXMoKVxuICAgIGNvbnN0IHBsYXlsaXN0U29uZ1JlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKCd5b3V0dWJlLmNvbS93YXRjaFxcXFw/dj0oLiopXFwmbGlzdD0nLCAnaScpXG4gICAgaWYgKHBsYXlsaXN0U29uZ1JlZ2V4LnRlc3QoY3VycmVudFVybCkpIGFkZFRhZ0JveGVzVG9QbGF5bGlzdFNvbmcoKVxufVxuXG5cbmZ1bmN0aW9uIGRlbGV0ZVRhZ0JveGVzKCkge1xuICAgIGNvbnN0IHRhZ0JveFdyYXBwZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRhZ2JveHdyYXBwZXInKSBhcyBOb2RlTGlzdE9mPEVsZW1lbnQ+O1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiB0YWdCb3hXcmFwcGVycykge1xuICAgICAgICBlbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYWRkVGFnQm94ZXNUb1BsYXlsaXN0U29uZygpIHtcbiAgICAvLyBwcmltYXJ5RWwucXVlcnlTZWxlY3RvcihcImRpdi53YXRjaC1hY3RpdmUtbWV0YWRhdGEgZGl2Om50aC1jaGlsZCgyKVwiKVxuICAgIGNvbnN0IGRlc2NyaXB0aW9uSG9sZGVyRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwieXRkLWV4cGFuZGVyIGRpdlwiKSBhcyBIVE1MRGl2RWxlbWVudDtcblxuICAgIGNvbnN0IGNoYW5uZWxOYW1lRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd5dC1mb3JtYXR0ZWQtc3RyaW5nW2NsYXNzKj1cInl0ZC1jaGFubmVsLW5hbWVcIl0gYScpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuXG4gICAgY29uc3Qgc29uZ05hbWVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXZbaWQ9XFxcImNvbnRhaW5lclxcXCJdIGgxIHl0LWZvcm1hdHRlZC1zdHJpbmdcIikgYXMgSFRNTEVsZW1lbnRcblxuICAgIC8vIFRoZSByZXRyaWV2ZWQgZWxlbWVudCBoYXMgcGFyZW50IHl0LSogd2hpY2ggaGFzIHBhcmVudCBoMy4gVGhlIHJldHJpZXZlZCBlbGVtZW50IGFsc28gaGFzIGF0dHJpYnV0ZSBocmVmIHdoaWNoIHN0YXJ0cyB3aXRoIC9wbGF5bGlzdFxuICAgIGNvbnN0IHBsYXlsaXN0TmFtZUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaDMgeXQtZm9ybWF0dGVkLXN0cmluZyBhW2hyZWZePVwiL3BsYXlsaXN0XCJdJykgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgXG4gICAgY29uc29sZS5sb2cocGxheWxpc3ROYW1lRWwuaW5uZXJUZXh0LCBjaGFubmVsTmFtZUVsLmlubmVyVGV4dCwgc29uZ05hbWVFbC5pbm5lclRleHQpO1xuXG4gICAgY29uc3QgdGFnQm94RWwgPSBuZXcgVGFnQm94KHBhcnNlSHJlZih3aW5kb3cubG9jYXRpb24uaHJlZiksIGNoYW5uZWxOYW1lRWwuaW5uZXJUZXh0LCBzb25nTmFtZUVsLmlubmVyVGV4dCwgcGxheWxpc3ROYW1lRWwuaW5uZXJUZXh0KVxuICAgIGRlc2NyaXB0aW9uSG9sZGVyRWwuYXBwZW5kQ2hpbGQodGFnQm94RWwuZGl2RWwpO1xufVxuXG5mdW5jdGlvbiBhZGRUYWdCb3hlc1RvUGxheWxpc3RJdGVtcygpIHtcbiAgICAvLyBUcmF2ZXJzaW5nIHRoZSBBY3R1YWwgU29uZyBQYW5lc1xuICAgIGNvbnN0IGRpc3BsYXlEaWFsb2dFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNkaXNwbGF5LWRpYWxvZycpWzBdIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgIC8vIGNvbnNvbGUubG9nKHBsYXlsaXN0TmFtZUVsKTtcbiAgICAvLyBjb25zb2xlLmxvZyhwbGF5bGlzdE5hbWVFbC5pbm5lclRleHQpO1xuICAgIGNvbnN0IHNvbmdQYW5lczogTm9kZUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2IHl0ZC1wbGF5bGlzdC12aWRlby1yZW5kZXJlclwiKTsgXG4gICAgc29uZ1BhbmVzLmZvckVhY2goKHNvbmdQYW5lKSA9PiB7XG4gICAgICAgIGxldCBzb25nUGFuZUVsID0gc29uZ1BhbmUgYXMgRWxlbWVudDtcblxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBkaXYgdGhhdCByZXByZXNlbnRzIHRoZSB3aG9sZSByb3dcbiAgICAgICAgY29uc3QgY29udGVudEVsID0gc29uZ1BhbmVFbC5jaGlsZHJlblsxXSBhcyBIVE1MRGl2RWxlbWVudDtcblxuICAgICAgICAvLyBUaGlzIGlzIHlvdXR1YmVzIGNvbnRhaW5lciBlbGVtZW50IGluY2x1ZGluZyB3aGljaCBjb250YWlucyB0aGUgdGh1bWJuYWlsIGFuZCBtZXRhZGF0YVxuICAgICAgICBjb25zdCBjb250YWluZXJFbCA9IGNvbnRlbnRFbC5jaGlsZHJlblswXSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgY29udGFpbmVyRWwuc3R5bGUuYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xuICAgICAgICBjb250ZW50RWwuc3R5bGUuZmxleFdyYXAgPSAnbm93cmFwJ1xuXG4gICAgICAgIC8vIFdpdGhpbiB0aGUgdGh1bWJuYWlsIHdlIGNhbiBnZXQgdGhlIGhyZWZcbiAgICAgICAgY29uc3QgdGh1bWJuYWlsRWwgPSBjb250YWluZXJFbC5jaGlsZHJlblswXSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgY29uc3QgYW5jaG9yRWwgPSB0aHVtYm5haWxFbC5jaGlsZHJlblswXSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcblxuICAgICAgICAvLyBXaXRoaW4gdGhlIG1ldGFkYXRhIHdlIGNhbiBnZXQgdGhlIHNvbmcgdGl0bGUsIGF1dGhvclxuICAgICAgICBjb25zdCBtZXRhRWwgPSBjb250YWluZXJFbC5jaGlsZHJlblsxXTtcbiAgICAgICAgY29uc3QgbWV0YURhdGFFbCA9IG1ldGFFbC5jaGlsZHJlblsxXS5jaGlsZHJlblswXSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgY29uc3QgY2hhbm5lbE5hbWVDb250YWluZXJFbCA9IG1ldGFEYXRhRWwuY2hpbGRyZW5bMF0uY2hpbGRyZW5bMF0uY2hpbGRyZW5bMF0gYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGNoYW5uZWxOYW1lRWwgPSBjaGFubmVsTmFtZUNvbnRhaW5lckVsLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzBdIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHNvbmdOYW1lRWwgPSBtZXRhRWwuY2hpbGRyZW5bMF0uY2hpbGRyZW5bMV0gYXMgSFRNTEFuY2hvckVsZW1lbnRcbiAgICAgICAgY29uc3QgcGxheWxpc3ROYW1lRWwgPSBkaXNwbGF5RGlhbG9nRWwuY2hpbGRyZW5bMV0gYXMgSFRNTEVsZW1lbnQ7XG5cblxuICAgICAgICBjb25zdCB0YWdCb3hFbCA9IG5ldyBUYWdCb3gocGFyc2VIcmVmKGFuY2hvckVsLmhyZWYpLCBjaGFubmVsTmFtZUVsLmlubmVyVGV4dCwgc29uZ05hbWVFbC5pbm5lclRleHQsIHBsYXlsaXN0TmFtZUVsLmlubmVyVGV4dClcbiAgICAgICAgY29udGVudEVsLmFwcGVuZENoaWxkKHRhZ0JveEVsLmRpdkVsKTtcbiAgICB9KVxufVxuXG5cbmZ1bmN0aW9uIHBhcnNlSHJlZihocmVmOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZWdleHA6IFJlZ0V4cCA9IC93YXRjaFxcP3Y9KC4qPylcXCYvaTtcbiAgICBjb25zdCByZXN1bHQ6IFJlZ0V4cE1hdGNoQXJyYXkgPSBocmVmLm1hdGNoKHJlZ2V4cCkgYXMgUmVnRXhwTWF0Y2hBcnJheTtcbiAgICByZXR1cm4gcmVzdWx0WzFdO1xufVxuXG4iLCJleHBvcnQgZGVmYXVsdCBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwic3JjL2NvbXBvbmVudHMvVGFnQWRkQnV0dG9uL1RhZ0FkZEJ1dHRvbi5jc3NcIjsiXSwibmFtZXMiOlsiQmFja2VuZE5vdGlmaWVyIiwidGFnc1Jlc291cmNlIiwidXBkYXRlVGFnc0ZvclNvbmciLCJocmVmIiwidGFncyIsImVzNm1hcHRvanNvbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJPYmplY3QiLCJmcm9tRW50cmllcyIsImVudHJpZXMiLCJmZXRjaCIsIm1ldGhvZCIsInJlZGlyZWN0IiwibW9kZSIsImJvZHkiLCJ0aGVuIiwicmVzcG9uc2UiLCJyZXNwb25zZXRleHQiLCJ0ZXh0IiwiY2F0Y2giLCJlcnJvciIsImNvbnNvbGUiLCJsb2ciLCJnZXRTdG9yYWdlVGFncyIsImdldFN0b3JhZ2VUYWdzVXJsIiwidGFnc1N0cmluZyIsIlRhZ0RhdGEiLCJjb25zdHJ1Y3RvciIsInR5cGUiLCJkYXRlIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwicG9zaXRpb24iLCJUYWdCb3giLCJ1cGxvYWRlciIsInNvbmduYW1lIiwicGxheWxpc3ROYW1lIiwiTWFwIiwibWF4VGFncyIsImRpdkVsIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidWwiLCJpbnB1dCIsImNsYXNzTGlzdCIsImFkZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldnQiLCJzdG9wUHJvcGFnYXRpb24iLCJpbm5lckhUTUwiLCJxdWVyeVNlbGVjdG9yIiwiYWRkVGFnRnJvbVVzZXIiLCJiaW5kIiwiYmFja2VuZFRhZ3MiLCJwYXJzZSIsImF1dG9tYXRlZFRhZ3MiLCJwYXJzZURhdGEiLCJhZGRUYWdzIiwicmVidWlsZFRhZ3MiLCJ0YWdzVG9BZGQiLCJhcnRpc3RGb3VuZCIsIk9TVFBsYXlsaXN0UmVnZXgiLCJSZWdFeHAiLCJ0ZXN0Iiwic2V0IiwiY2xhc3NpY3NQbGF5bGlzdFJlZ2V4IiwibmlnaHRjb3JlUmVnZXgiLCJ0YW5vY1JlZ2V4IiwidG91aG91UmVnZXgiLCJtaWt1UmVnZXgiLCJrYWZ1UmVnZXgiLCJzbGF2ZVJlZ2V4IiwiaWFSZWdleCIsImdhbWVSZWdleCIsImdhbWVNYXRjaCIsIm1hdGNoIiwidHJpbSIsInBlcnNvbmE1UmVnZXgiLCJwZXJzb25hNU1hdGNoIiwicGVyc29uYTRSZWdleCIsInBlcnNvbmE0TWF0Y2giLCJkYW5nYW5yb25wYVJlZ2V4IiwiZGFuZ2Fucm9ucGFNYXRjaCIsImhvbmthaVJlZ2V4IiwiaG9ua2FpTWF0Y2giLCJhbmltZVJlZ2V4IiwiYW5pbWVNYXRjaCIsInRvcGljUmVnZXgiLCJzbGljZSIsIm9mZmljaWFsUmVnZXgiLCJyZXN1bHQiLCJzbGFzaFJlZ2V4IiwidXBsb2FkZXJJblNvbmdOYW1lUmVnZXgiLCLjgaHjgoPjgpPjga3jgotJblVwbG9hZGVyTmFtZVJlZ2V4IiwiZGFzaFJlZ2V4IiwiaXNOZXdUYWciLCJmb3JFYWNoIiwidmFsdWUiLCJrZXkiLCJhZGRUYWdUb0xvY2FsIiwidGFnTmFtZSIsImhhcyIsInNpemUiLCJlIiwiaW5wdXRFbCIsInRhcmdldCIsInJlcGxhY2UiLCJyZW1vdmVUYWciLCJlbGVtZW50IiwiZGVsZXRlIiwicmVtb3ZlIiwicXVlcnlTZWxlY3RvckFsbCIsImxpIiwidGFnIiwibGlUYWciLCJyZW1vdmVUYWdCb3VuZCIsImluc2VydEFkamFjZW50RWxlbWVudCIsImRlbGF5IiwidCIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsIndpbmRvdyIsIm9ubG9hZCIsImluaXRpYWxpemVUYWdCb3hlcyIsInN0YXJ0SHJlZk9ic2VydmVyIiwibG9jYXRpb24iLCJjdXJyZW50aHJlZiIsImJvZHlMaXN0Iiwib2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwibXV0YXRpb25zIiwibXV0YXRpb24iLCJkZWxldGVUYWdCb3hlcyIsImNvbmZpZyIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJvYnNlcnZlIiwiY3VycmVudFVybCIsInBsYXlsaXN0UmVnZXgiLCJhZGRUYWdCb3hlc1RvUGxheWxpc3RJdGVtcyIsInBsYXlsaXN0U29uZ1JlZ2V4IiwiYWRkVGFnQm94ZXNUb1BsYXlsaXN0U29uZyIsInRhZ0JveFdyYXBwZXJzIiwiZGVzY3JpcHRpb25Ib2xkZXJFbCIsImNoYW5uZWxOYW1lRWwiLCJzb25nTmFtZUVsIiwicGxheWxpc3ROYW1lRWwiLCJpbm5lclRleHQiLCJ0YWdCb3hFbCIsInBhcnNlSHJlZiIsImFwcGVuZENoaWxkIiwiZGlzcGxheURpYWxvZ0VsIiwic29uZ1BhbmVzIiwic29uZ1BhbmUiLCJzb25nUGFuZUVsIiwiY29udGVudEVsIiwiY2hpbGRyZW4iLCJjb250YWluZXJFbCIsInN0eWxlIiwiYWxpZ25JdGVtcyIsImZsZXhXcmFwIiwidGh1bWJuYWlsRWwiLCJhbmNob3JFbCIsIm1ldGFFbCIsIm1ldGFEYXRhRWwiLCJjaGFubmVsTmFtZUNvbnRhaW5lckVsIiwicmVnZXhwIl0sInNvdXJjZVJvb3QiOiIifQ==