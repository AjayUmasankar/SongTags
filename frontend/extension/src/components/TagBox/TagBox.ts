import { BackendNotifier } from '../BackendNotifier';


export class TagData {
    type: string;
    date: string;
    position: number;
    constructor (type: string = "default", date: string = new Date().toISOString()) {
        this.type = type;
        this.date = date;
        if(type == "artist") {
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

export class TagBox {
    playlistName: string;
    href: string;

    divEl: Element;
    input: HTMLInputElement;

    maxTags: number;
    tags: Map<string, TagData>;


    constructor(href: string, uploader: string, songname: string, playlistName: string) {
        // this = document.createElement('div');
        // let tagBoxDiv: Element = document.createElement('DIV');
        this.playlistName = playlistName;
        this.href = href; 
        this.tags = new Map<string, TagData>();
        this.maxTags = 10,

        this.divEl = document.createElement('DIV');
        if(playlistName === "Watch later") {
            // this.ul = document.createElement('ul') as HTMLUListElement;
            this.input = document.createElement('input');
        } else {
            this.divEl.classList.add("tagbox");
            this.divEl.addEventListener("click", (evt: any) => evt.stopPropagation()); // Or else we trigger youtubes click handler and enter the song
            this.divEl.innerHTML =
            `
                <div class="text-input">
                    <input type="text" id="` + href + `" placeholder="">
                    <label for="` + href + `" class=taglabel>+</label>
                </div>
            `
            this.input = this.divEl.querySelector("input") as HTMLInputElement,
            this.input.addEventListener("keyup", this.addTagFromUser.bind(this));

            // Let backend do all the work of getting tags!
            BackendNotifier.getTags("ajay", this.href, uploader, songname, playlistName).then(tagsString => {
                let tags: Map<string, TagData> = new Map(Object.entries(JSON.parse(tagsString)));
                this.tags = tags;
                this.rebuildTags();             // needed for first runthrough
            })
        }
    }

    // We use this map to enable bulk updates instead of one by one whenever a change occurs
    // addTags(automatedTags: Map<string, TagData>, backendTags:Map<string, TagData>) {
    addTags(tags: Map<string, TagData>) {
        let isNewTag = false;
        tags.forEach((value, key) => {
            isNewTag = this.addTagToLocal(key, value.type);
        })
        
        if(isNewTag) { 
            BackendNotifier.updateTagsForSong("ajay", this.href, this.tags); 
            this.rebuildTags();   
        }
                                                // Need to do this for first time only to create tags on frontend
    }

    addTagToLocal(tagName: string, type: string = "default"): boolean {
        // Can have up to 10 tags. No duplicates. Minimum length = 1
        let isNewTag = false;
        if(!this.tags.has(tagName)){
            isNewTag = true;
            if(this.tags.size >= 10) return false; 
            this.tags.set(tagName, new TagData(type));
        }
        return isNewTag;
    }

    // Reads input field and adds the tag
    addTagFromUser(e:KeyboardEvent){
        if (e.key !== 'Enter') return;
        let inputEl = e.target as HTMLInputElement;
        let tagName = inputEl.value.replace(/\s+/g, ' ');

        this.addTags(new Map<string, TagData>([[tagName, new TagData("default")]]));
        inputEl.value = "";
    }

    removeTag(evt:MouseEvent, tagName: string){
        let element = evt.target as Element;
        console.log('Removing tag element:', element);
        if(!element) return;
        this.tags.delete(tagName)
        element.remove();
        BackendNotifier.updateTagsForSong("ajay", this.href, this.tags);
    }

    // Rebuilds the tag box contents for the associated href
    rebuildTags(){
        this.divEl.querySelectorAll("a").forEach(li => li.remove());
        this.tags.forEach((tag, key) => {
            let anchorTag: HTMLAnchorElement = document.createElement('a');
            anchorTag.href = "javascript:;";
            anchorTag.classList.add("pill");
            anchorTag.classList.add(tag.type); // will be used to give different color to tags
            anchorTag.innerHTML = `\#${key} `
            let removeTagBound = this.removeTag.bind(this);
            anchorTag.addEventListener('click', (evt) => removeTagBound(evt,key));
            this.divEl.insertAdjacentElement("afterbegin", anchorTag);
        })
    }

    parseData(songname: string, uploader: string, playlistName: string) {
        let tagsToAdd = new Map<string, TagData>();
        let artistFound: boolean = false; 
        

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
         if(artistFound) return tagsToAdd; 


        // Case 3 - Found artist by removing \
        const slashRegex = new RegExp('(.*?) \/')
        var result: RegExpMatchArray = uploader.match(slashRegex) as RegExpMatchArray;
        if(result) {
            tagsToAdd.set(result[1], new TagData("artist"))
            return tagsToAdd;
        }

        // Case 5 - Found artist that has まふまふちゃんねる
        const ちゃんねるInUploaderNameRegex = new RegExp('(.*?)ちゃんねる', 'i')
        var result: RegExpMatchArray = uploader.match(ちゃんねるInUploaderNameRegex) as RegExpMatchArray;
        if (result) {
            tagsToAdd.set(result[1], new TagData("artist"));
            return tagsToAdd;
        }

        // Case 998 - Delimit on '-' lmao..
        const dashRegex = new RegExp('(.*?) -.*')
        var result: RegExpMatchArray = songname.match(dashRegex) as RegExpMatchArray;
        if(result) {
            tagsToAdd.set(result[1], new TagData("artist"))
            return tagsToAdd;
        }

        // Case 999 - Return uploader only.. artist not found
        tagsToAdd.set(uploader, new TagData("uploader"));
        return tagsToAdd;
    }




}
