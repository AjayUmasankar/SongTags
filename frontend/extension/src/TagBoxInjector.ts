import { TagBox } from './components/TagBox/TagBox';

const delay = (t:number) => new Promise(resolve => setTimeout(resolve, t));

window.onload = () => {
    const currentUrl: string = window.location.href;
    const playlistRegex: RegExp = new RegExp('youtube\.com\/playlist\\?list=', 'i')
    if (playlistRegex.test(currentUrl)) injectTagBoxToPlaylistItems();
    const playlistSongRegex: RegExp = new RegExp('youtube.com/watch\\?v=(.*)\&list=', 'i')
    if (playlistSongRegex.test(currentUrl)) {
        waitForYoutube();
    }
}

function injectTagBoxToSong() {
    // primaryEl.querySelector("div.watch-active-metadata div:nth-child(2)")
    var playlistNameEl = document.querySelector('h3 yt-formatted-string a[href^="/playlist"]') as HTMLAnchorElement;
    var channelNameEl = document.querySelector('yt-formatted-string[class*="ytd-channel-name"] a') as HTMLAnchorElement;
    var songNameEl = document.querySelector("div[id=\"container\"] h1 yt-formatted-string") as HTMLElement

    console.log(`Playlist Name: ${playlistNameEl.innerText} \nChannel Name: ${channelNameEl.innerText} \nSong Name: ${songNameEl.innerText}`);

    const belowThePlayerEl = document.querySelector("div[id=\"above-the-fold\"]") as HTMLDivElement;

    const tagBoxEl = new TagBox(parseHref(window.location.href), channelNameEl.innerText, songNameEl.innerText, playlistNameEl.innerText)

    belowThePlayerEl.insertBefore(tagBoxEl.divEl, belowThePlayerEl.firstChild);
    console.log("Added tagbox to currently playing song", new Date().toISOString());

}

function injectTagBoxToPlaylistItems() {
    // Traversing the Actual Song Panes
    const displayDialogEl = document.querySelectorAll('#display-dialog')[0] as HTMLDivElement;
    const songPanes: NodeList = document.querySelectorAll("div ytd-playlist-video-renderer"); 
    console.log(songPanes)
    songPanes.forEach((songPane) => {
        let songPaneEl = songPane as Element;

        // This is the div that represents the whole row
        const contentEl = songPaneEl.children[1] as HTMLDivElement;

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
        const playlistNameEl = displayDialogEl.children[1] as HTMLElement;

        const tagBoxEl = new TagBox(parseHref(anchorEl.href), channelNameEl.innerText, songNameEl.innerText, playlistNameEl.innerText)
        console.log('This songs parsed url is: ', parseHref(anchorEl.href));
        contentEl.appendChild(tagBoxEl.divEl);
    })
}

const waitForYoutube = async (rootElement = document.documentElement) => {
    let selector:any = 'above-the-fold'
    console.log(`Waiting for ${selector}...`, new Date().toISOString());
    let config = {
        childList: true,
        subtree: true,
    }
    // First, do stuff when element spawns
    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            const element = document.getElementById(selector);
            if (element) {
                console.log(`${selector} was found!`, new Date().toISOString());
                injectTagBoxToSong();
                observer.disconnect();
                resolve(element as HTMLDivElement);
            }
        });
        observer.observe(rootElement, config);
    }).then(element => {
    // Second, do stuff whenever that element changes
        selector = 'div#above-the-fold div#title h1' // element that holds title
        const descriptionChanged = function (mutationsList:any, observer:any) {
            console.log(`Changes detected in ${selector}`, new Date().toISOString());
            console.log(mutationsList);
            deleteTagBoxes();
            injectTagBoxToSong();
        }
        let descriptionObserver = new MutationObserver(descriptionChanged)
        descriptionObserver.observe((element as HTMLDivElement).querySelector(selector), config)
    })
};




function deleteTagBoxes() {
    const tagBoxWrappers = document.querySelectorAll('.tagbox') as NodeListOf<Element>;
    for (const element of tagBoxWrappers) {
        element.remove();
    }
}


function parseHref(href: string) {
    const regexp: RegExp = /watch\?v=(.*?)\&/i;
    const result: RegExpMatchArray = href.match(regexp) as RegExpMatchArray;
    return result[1];
}






