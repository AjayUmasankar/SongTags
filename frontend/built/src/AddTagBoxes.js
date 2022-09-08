"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const delay = (t) => new Promise(resolve => setTimeout(resolve, t));
window.onload = () => loadExtension();
function loadExtension() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Window Loaded!", Date.now());
        //const userToTags = await initializeMongoDB();
        delay(1000).then(() => { initializeTagBoxes(); });
        //delay(1000).then(() => initializeTagBoxes());
        return;
        // Tried to obeserve the playlist items loading in but.. its a 50/50 on whether our code loads first or theirs!
        const playListElementsHolder = document.querySelector('div ytd-item-section-renderer');
        const observerOptions = {
            childList: true
        };
        const observer = new MutationObserver((mutations, observer) => {
            for (let mutation of mutations) {
                observer.disconnect();
                delay(500).then(() => { initializeTagBoxes(); });
            }
        });
        observer.observe(playListElementsHolder, observerOptions);
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
    });
}
function initializeTagBoxes() {
    console.log("Song Panes Loaded!", Date.now());
    // Traversing the Actual Song Panes
    const songPanes = document.querySelectorAll("div ytd-playlist-video-renderer");
    songPanes.forEach((songPane) => {
        let songPaneEl = songPane;
        //console.log(songPaneEl.children);
        const contentNode = songPaneEl.children[1];
        const menuNode = songPaneEl.children[2];
        const anchorEl = contentNode.children[0].children[0].children[0];
        //console.log(anchorEl);
        console.log(parseHref(anchorEl.href));
        const tagBoxEl = new tagBox(parseHref(anchorEl.href));
        contentNode.appendChild(tagBoxEl.divEl);
        //menuNode.insertAdjacentElement('beforebegin', tagBoxEl.divEl);
    });
}
function parseHref(href) {
    //const regex = new RegExp('www.youtube.com/watch?v=(.*)&list=')
    const regexp = /watch\?v=(.*)&list/i;
    const result = href.match(regexp);
    return result[1];
}
/*
function popUpInitialized(dropDownNode: Node) {
    console.log("Popup initialized!");

    // console.log(dropDownNode);
    // console.log(dropDownNode.childNodes[1]);
    // console.log(dropDownNode.childNodes[1].firstElementChild)
    // console.log(dropDownNode.childNodes[1].firstElementChild.firstElementChild);

    let someEl = dropDownNode.childNodes[1] as Element

    let dropDownMenu = ((someEl.firstElementChild as Element).firstElementChild as Element);
    console.log(dropDownMenu);
    let dropDownMenuItems = dropDownMenu.children;
    console.log(dropDownMenuItems);

    let saveToPlaylist = dropDownMenuItems[2];
    console.log(saveToPlaylist);
    let cloned = saveToPlaylist.cloneNode();
    console.log(saveToPlaylist.insertAdjacentElement('afterend', cloned as Element));
    // console.log(saveToPlaylist);
}

// Checks script injection status by clicking on button
let btn = document.getElementById('checkExtensionPerms');
btn.addEventListener('click', (event) => {
    console.log('Clicked button in categories.js!');
    chrome.tabs.getCurrent((tab) => {
        console.log(tab);
        console.log("Injected script into: " + tab.url + "!");
    })
    // .then((res) => {
    //     console.log(res);
    // });
})
*/ 
//# sourceMappingURL=AddTagBoxes.js.map