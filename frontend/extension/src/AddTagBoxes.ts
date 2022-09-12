import { TagBox } from './components/TagBox/TagBox';

const delay = (t:number) => new Promise(resolve => setTimeout(resolve, t));

window.onload = () => {
    console.log("Song Panes Loaded!", Date.now());
    delay(1000).then(() => { initializeTagBoxes(); })
    startHrefObserver(window.location.href);
    return;
} 

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


function initializeTagBoxes() {
    const currentUrl: string = window.location.href;

    const playlistRegex: RegExp = new RegExp('youtube\.com\/playlist\\?list=', 'i')
    if (playlistRegex.test(currentUrl)) addTagBoxesToPlaylistItems()
    const playlistSongRegex: RegExp = new RegExp('youtube.com/watch\\?v=(.*)\&list=', 'i')
    // console.log(currentUrl);
    if (playlistSongRegex.test(currentUrl)) addTagBoxesToPlaylistSong()
}

function startHrefObserver(currenthref: string) {
    var bodyList = document.querySelector("body") as HTMLBodyElement;

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (currenthref != window.location.href) {
                currenthref = window.location.href;
                /* Changed ! your code here */
                delay(5000).then(() => {
                    deleteTagBoxes();
                    initializeTagBoxes();
                })
            }
        });
    });
    
    var config = {
        childList: true,
        subtree: true
    };
    
    observer.observe(bodyList, config);
}

function deleteTagBoxes() {
    const tagBoxWrappers = document.querySelectorAll('.tagboxwrapper') as NodeListOf<Element>;
    for (const element of tagBoxWrappers) {
        element.remove();
    }
}

function addTagBoxesToPlaylistSong() {
    const watchFlexyEl = document.querySelector("ytd-watch-flexy") as HTMLElement;
    const primaryEl = watchFlexyEl.querySelector("div > div") as HTMLDivElement;

    primaryEl.querySelector("div.watch-active-metadata div:nth-child(2)")
    const descriptionHolderEl = primaryEl.querySelector("div#content") as HTMLDivElement;
    // const columnsEl = primaryEl.parentElement as HTMLDivElement;
    // columnsEl.style.margin = '0px';
    // columnsEl.insertBefore(tagBoxEl.divEl, columnsEl.firstChild);


    var channelNameEl = primaryEl.querySelector("div.style-scope ytd-channel-name div div yt-formatted-string a") as HTMLAnchorElement;

    var songNameEl = primaryEl.querySelector("h1 yt-formatted-string") as HTMLElement;


    const tagBoxEl = new TagBox(parseHref(window.location.href), channelNameEl.innerText, songNameEl.innerText, true)
    descriptionHolderEl.appendChild(tagBoxEl.divEl);

}

function addTagBoxesToPlaylistItems() {
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

        const songNameEl = metaEl.children[0].children[1] as HTMLAnchorElement




        const tagBoxEl = new TagBox(parseHref(anchorEl.href), channelNameEl.innerText, songNameEl.innerText, true)
        contentEl.appendChild(tagBoxEl.divEl);
    })
}


function parseHref(href: string) {
    console.log(href)
    const regexp: RegExp = /watch\?v=(.*?)\&/i;
    const result: RegExpMatchArray = href.match(regexp) as RegExpMatchArray;
    console.log(result[1])
    return result[1];
}

