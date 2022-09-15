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

// export class Tag2 {
//     name: string;
//     type: string;
//     date: string;
//     constructor (name: string, type: string = "default", date: string = new Date().toISOString()) {
//         this.name = name;
//         this.type = type;
//         this.date = date;
//     }
// }

export class TagBox {
    playlistName: string;
    href: string;

    divEl: Element;
    ul: HTMLUListElement;
    input: HTMLInputElement;

    maxTags: number;
    tags: Map<string, TagData>;


    constructor(href: string, uploader: string, songname: string, playlistName: string) {
        // this = document.createElement('div');
        // let tagBoxDiv: Element = document.createElement('DIV');
        this.playlistName = playlistName;
        this.href = href; 
        this.divEl = document.createElement('DIV');
        this.divEl.classList.add("tagboxwrapper");
        this.divEl.addEventListener("click", (evt: any) => evt.stopPropagation()); // Or else we trigger youtubes click handler and enter the song
        this.divEl.innerHTML =
        `
        <div class = "tagbox">
            <ul> 
            <div class="text-input">
            <input type="text" id="` + href + `" placeholder="">
            <label for="` + href + `" class=taglabel>+</label>
            </div>
            </ul>
        </div>
        `
        this.ul = this.divEl.querySelector("ul") as HTMLUListElement,
        this.input = this.divEl.querySelector("input") as HTMLInputElement,
        this.input.addEventListener("keyup", this.addTagFromUser.bind(this));

        this.tags = new Map<string, TagData>();
        this.maxTags = 10,

        // We pull the tags that exist already from db
        // We add to this list from our hardcoded values
        BackendNotifier.getStorageTags(this.href).then(tagsString => {
            let backendTags: Map<string, TagData> = new Map(Object.entries(JSON.parse(tagsString)));
            let automatedTags: Map<string, TagData> = this.parseData(songname, uploader, playlistName)
            // this.addTags(new Map([backendTags, ...automatedTags]));
            this.tags = backendTags;
            this.addTags(automatedTags);
            this.rebuildTags();             // needed for first runthrough
        })
    }


    parseData(songname: string, uploader: string, playlistName: string) {
        let tagsToAdd = new Map<string, TagData>();
        let artistFound: boolean = false; 
        
        /*******************************************************************
         *       Regex to parse song name and get extra information        *
         *******************************************************************/  
        /* Regex to parse song name and get extra information*/
        const nightcoreRegex = new RegExp('nightcore', 'i')
        if (nightcoreRegex.test(songname)) tagsToAdd.set("Nightcore", new TagData("category"));
        
        const tanocRegex = new RegExp('usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\\+pazolite|RoughSketch|Kobaryo|P\\*Light|nora2r|Relect|Getty|Tatsunoshin', 'i')
        if (tanocRegex.test(songname)) tagsToAdd.set("TANO*C", new TagData("category"));

        const touhouRegex = new RegExp('東方|Touhou', 'i')
        if (touhouRegex.test(songname)) tagsToAdd.set("東方", new TagData("category"))

        /* Vocaloid */
        const mikuRegex = new RegExp('Miku|ミク', 'i')
        if (mikuRegex.test(songname)) tagsToAdd.set("ミク", new TagData("vocaloid"));

        const kafuRegex = new RegExp('Kafu|可不', 'i')
        if (kafuRegex.test(songname)) tagsToAdd.set("可不", new TagData("vocaloid"));

        const slaveRegex = new RegExp('Slave\.V-V-R', 'i')
        if (slaveRegex.test(songname)) tagsToAdd.set("Slave.V-V-R", new TagData("vocaloid"));

        const iaRegex = new RegExp(' IA')
        if (iaRegex.test(songname)) tagsToAdd.set("IA", new TagData("vocaloid"));


        /* Game and Anime */
        const gameRegex = new RegExp('(Blue Archive|Counterside|Lost Ark|Arknights)', 'i')
        const gameMatch = songname.match(gameRegex)
        if (gameMatch) {tagsToAdd.set(gameMatch[1].trim(), new TagData("game")); artistFound = true;}

        const persona5Regex = new RegExp('(P5|P5R|Persona 5)')
        const persona5Match = songname.match(persona5Regex);
        if (persona5Match) { tagsToAdd.set("Persona 5", new TagData("game")); artistFound = true;}
        const persona4Regex = new RegExp('(P4|P4G|Persona 4)')
        const persona4Match = songname.match(persona4Regex);
        if (persona4Match) {tagsToAdd.set("Persona 4", new TagData("game")); artistFound = true;}

        const danganronpaRegex = new RegExp('(Danganronpa|Danganronpa 2|SDR2|Danganronpa V3|Danganronpa 3)')
        const danganronpaMatch = songname.match(danganronpaRegex);
        if (danganronpaMatch) {tagsToAdd.set("Danganronpa", new TagData("game")); artistFound = true;}

        const honkaiRegex = new RegExp('(HI3|Honkai Impact 3|Houkai Impact 3)')
        const honkaiMatch = songname.match(honkaiRegex);
        if (honkaiMatch) {tagsToAdd.set("Honkai Impact 3rd", new TagData("game")); artistFound = true;}

        const animeRegex = new RegExp('(Bleach|Gintama|Link Click)', 'i')
        const animeMatch = songname.match(animeRegex)
        if (animeMatch) {tagsToAdd.set(animeMatch[1].trim(), new TagData("anime")); artistFound = true;}
        

        /*******************************************************************
         *                 Regex to parse playlist name                    *
         *******************************************************************/  
        const OSTPlaylistRegex = new RegExp('Game/TV/Movie OST')
        if (OSTPlaylistRegex.test(playlistName)) tagsToAdd.set("OST", new TagData("category"));

        const classicsPlaylistRegex = new RegExp('^Classics$')
        if (classicsPlaylistRegex.test(playlistName)) tagsToAdd.set("ᛄᛄᛄᛄᛄ", new TagData("GOAT"));

        tagsToAdd.set("INPLAYLIST", new TagData ("metadata"));

        /*******************************************************************
         *      Regex to parse uploader name (and try to find artist)      *
         *******************************************************************/  
        // Case 0 - Artist already fouind 
         if(artistFound) return tagsToAdd; 

        // Case 1 - Found artist through topic
        const topicRegex = new RegExp(' - Topic', 'i')
        if (topicRegex.test(uploader)) {
            tagsToAdd.set(uploader.slice(0, -8), new TagData("artist"));
            return tagsToAdd;
        }

        // Case 2 - Found artist by removing Official
        const officialRegex = new RegExp('(.*?) Official', 'i')
        result = uploader.match(officialRegex) as RegExpMatchArray;
        if(result){
            tagsToAdd.set(result[1], new TagData("artist"))
            return tagsToAdd;
        }

        // Case 3 - Found artist by removing \
        const slashRegex = new RegExp('(.*?) \/')
        var result: RegExpMatchArray = uploader.match(slashRegex) as RegExpMatchArray;
        if(result) {
            tagsToAdd.set(result[1], new TagData("artist"))
            return tagsToAdd;
        }
 
        // Case 4 - Found artist as uploader name  exists in song name 
        const uploaderInSongNameRegex = new RegExp(uploader, 'i')
        if (uploaderInSongNameRegex.test(songname)) {
            tagsToAdd.set(uploader, new TagData("artist"));
            return tagsToAdd;
        }

        // Case 5 - Found artist that has まふまふちゃんねる
        const ちゃんねるInUploaderNameRegex = new RegExp('(.*?)ちゃんねる', 'i')
        console.log(uploader)
        var result: RegExpMatchArray = uploader.match(ちゃんねるInUploaderNameRegex) as RegExpMatchArray;
        if (result) {
            tagsToAdd.set(result[1], new TagData("artist"));
            return tagsToAdd;
        }

        // Case 6 - Found artist that has feat. in title

        // Case 997 - KMNZ x EXAMPLE is in title, uploader is KMNZ LITA

        // Case 499

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




    // We use this map to enable bulk updates instead of one by one whenever a change occurs
    // addTags(automatedTags: Map<string, TagData>, backendTags:Map<string, TagData>) {
    addTags(tags: Map<string, TagData>) {
        let isNewTag = false;
        tags.forEach((value, key) => {
            isNewTag = this.addTagToLocal(key, value.type);
        })
        
        if(isNewTag) { 
            BackendNotifier.updateTagsForSong(this.href, this.tags); 
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
        BackendNotifier.updateTagsForSong(this.href, this.tags);
    }

    // Rebuilds the tag box contents for the associated href
    rebuildTags(){
        this.ul.querySelectorAll("li").forEach(li => li.remove());
        this.tags.forEach((tag, key) => {
            let liTag: HTMLLIElement = document.createElement('li');
            liTag.classList.add(tag.type)
            liTag.innerHTML = `${key}`
            // let liTag = `<li>${tag} <i class="uit uit-multiply"></i></li>`; # if you need the X
            let removeTagBound = this.removeTag.bind(this);
            liTag.addEventListener('click', (evt) => removeTagBound(evt,key));
            this.ul.insertAdjacentElement("afterbegin", liTag);
        })
    }
}
