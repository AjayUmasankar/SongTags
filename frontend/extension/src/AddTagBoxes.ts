import { TagBox } from './components/TagBox/TagBox';

const delay = (t:number) => new Promise(resolve => setTimeout(resolve, t));

window.onload = () => main();

async function main() {
    console.log("Window Loaded!", Date.now());
    //const userToTags = await initializeMongoDB();
    delay(1000).then(() => {initializeTagBoxes(); })
    //delay(1000).then(() => initializeTagBoxes());
    return;

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

function initializeTagBoxes() {
    console.log("Song Panes Loaded!", Date.now());
    
    // Traversing the Actual Song Panes
    const songPanes: NodeList = document.querySelectorAll("div ytd-playlist-video-renderer"); 
    songPanes.forEach((songPane) => {
        let songPaneEl = songPane as Element;

        // This is the div that represents the whole row
        const contentEl = songPaneEl.children[1] as HTMLDivElement;
        const menuNode : Element = songPaneEl.children[2]; 

        // This is youtubes container element including which contains the thumbnail and metadata
        const containerEl = contentEl.children[0] as HTMLDivElement;
        containerEl.style.alignItems = 'center';
        contentEl.style.flexWrap = 'nowrap'

        // Within the thumbnail we can get the href
        const thumbnailEl = containerEl.children[0] as HTMLElement;
        const anchorEl = thumbnailEl.children[0] as HTMLAnchorElement;

        // Within the metadata we can get the song title, author
        const metaEl = containerEl.children[1];
        const metaDataEl = metaEl.children[1].children[0] as HTMLDivElement;
        const channelNameContainerEl = metaDataEl.children[0].children[0].children[0] as HTMLDivElement;
        const channelNameEl = channelNameContainerEl.children[0].children[0].children[0] as HTMLAnchorElement;
        // console.log(channelNameEl.innerText)

        const songNameEl = metaEl.children[0].children[1] as HTMLAnchorElement
        // console.log(songNameEl);
        // console.log(songNameEl.innerText)



        const tagBoxEl = new TagBox(parseHref(anchorEl.href), channelNameEl.innerText, songNameEl.innerText)
        contentEl.appendChild(tagBoxEl.divEl);
    })
}

function parseHref(href: string) {
    const regexp: RegExp = /watch\?v=(.*)&list/i;
    const result: RegExpMatchArray = href.match(regexp) as RegExpMatchArray;
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