import { BackendNotifier } from '../BackendNotifier';


export class Tag {
    type: string;
    // inPlaylist: Boolean;
    constructor (type: string = "default" /*, inPlaylist: Boolean = false*/) {
        this.type = type;
        // this.inPlaylist = inPlaylist;
    }
}
export class TagBox {
    inPlaylist: boolean;
    href: string;

    divEl: Element;
    ul: HTMLUListElement;
    input: HTMLInputElement;

    maxTags: number;
    tags: Map<string, Tag>;


    constructor(href: string, uploader: string, songname: string, inPlaylist: boolean) {
        // this = document.createElement('div');
        // let tagBoxDiv: Element = document.createElement('DIV');
        this.inPlaylist = inPlaylist;
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
        this.input.addEventListener("keyup", this.addTagEvent.bind(this));

        this.tags = new Map<string, Tag>();
        this.maxTags = 10,

        // We pull the tags that exist already from db
        // We add to this list from our hardcoded values
        BackendNotifier.getStorageTags(this.href).then(tagsString => {
            this.tags = new Map(Object.entries(JSON.parse(tagsString)));
            let tagsToAdd: Map<string, Tag> = this.parseData(songname, uploader)
            if(inPlaylist) tagsToAdd.set("INPLAYLIST", new Tag("metadata"));
            this.addTags(tagsToAdd);
        })
    }


    parseData(songname: string, uploader: string) {
        let tagsToAdd = new Map<string, Tag>();
        
        /*******************************************************************
         *       Regex to parse song name and get extra information        *
         *******************************************************************/  
        /* Regex to parse song name and get extra information*/
        const nightcoreRegex = new RegExp('nightcore', 'i')
        if (nightcoreRegex.test(songname)) tagsToAdd.set("Nightcore", new Tag("category"));
        
        const tanocRegex = new RegExp('usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\\+pazolite|RoughSketch|Kobaryo|P\\*Light|nora2r|Relect|Getty|Tatsunoshin', 'i')
        if (tanocRegex.test(songname)) tagsToAdd.set("TANO*C", new Tag("category"));

        const mikuRegex = new RegExp('Miku|ミク', 'i')
        if (mikuRegex.test(songname)) tagsToAdd.set("ミク", new Tag("vocaloid"));

        const kafuRegex = new RegExp('Kafu|可不', 'i')
        if (kafuRegex.test(songname)) tagsToAdd.set("可不", new Tag("vocaloid"));

        const slaveRegex = new RegExp('Slave\.V-V-R', 'i')
        if (slaveRegex.test(songname)) tagsToAdd.set("Slave.V-V-R", new Tag("vocaloid"));

        const iaRegex = new RegExp('IA')
        if (iaRegex.test(songname)) tagsToAdd.set("IA", new Tag("vocaloid"));

        const touhouRegex = new RegExp('東方|Touhou', 'i')
        if (touhouRegex.test(songname)) tagsToAdd.set("東方", new Tag("category"))

        const khRegex = new RegExp('Kingdom Hearts', 'i')
        if (khRegex.test(songname)) tagsToAdd.set("Kingdom Hearts", new Tag("game"))




        /*******************************************************************
         *   Regex to do with parsing uploader and trying to find artist   *
         *******************************************************************/  

        // Regex to parse song name and deduce artist 
        // const dashRegex = new RegExp('(.*?) -.*')
        // var result: RegExpMatchArray = songname.match(dashRegex) as RegExpMatchArray;
        // if(result) {
        //     tagsToAdd.set(result[1], new Tag("artist"))
        // }
        // console.log(result[1])

        // Case 1 - Found artist through topic
        const topicRegex = new RegExp(' - Topic', 'i')
        if (topicRegex.test(uploader)) {
            tagsToAdd.set(uploader.slice(0, -8), new Tag("artist"));
            return tagsToAdd;
        }

        // Case 2 - Found artist by removing Official
        const officialRegex = new RegExp('(.*?) Official', 'i')
        result = uploader.match(officialRegex) as RegExpMatchArray;
        if(result){
            tagsToAdd.set(result[1], new Tag("artist"))
            return tagsToAdd;
        }

        // Case 3 - Found artist by removing \
        const slashRegex = new RegExp('(.*?) \/')
        var result: RegExpMatchArray = uploader.match(slashRegex) as RegExpMatchArray;
        if(result) {
            tagsToAdd.set(result[1], new Tag("artist"))
            return tagsToAdd;
        }
 
        // Case 4 - Found artist as entry exists in song name and uploader
        const uploaderInSongNameRegex = new RegExp(uploader, 'i')
        if (uploaderInSongNameRegex.test(songname)) {
            tagsToAdd.set(uploader, new Tag("artist"));
            return tagsToAdd;
        }
        
        // Case 5 - Return uploader only.. artist not found
        tagsToAdd.set(uploader, new Tag("uploader"));
        return tagsToAdd;
    }


    // Reads input field and adds the tag
    addTagEvent(e:KeyboardEvent){
        if (e.key !== 'Enter') return;
        let inputEl = e.target as HTMLInputElement;
        let tagName = inputEl.value.replace(/\s+/g, ' ');

        this.addTags(new Map<string, Tag>([[tagName, {"type" : "default"}]]));
        inputEl.value = "";
    }

    // We use this map to enable bulk updates instead of one by one whenever a change occurs
    addTags(tagsToAdd: Map<string, Tag>) {
        let newTag = false;
        tagsToAdd.forEach((value, key) => {
            newTag = this.addTag(key, value.type);
        })
        
        if(newTag) { BackendNotifier.updateTagsForSong(this.href, this.tags); }
        this.rebuildTags();                                         // Need to do this for first time only to create tags on frontend
    }

    addTag(tagName: string, type: string = "default"): boolean {
        // Can have up to 10 tags. No duplicates. Minimum length = 1
        let newTag = false;
        if(tagName.length > 1 && !this.tags.has(tagName)){
            newTag = true;
            if(this.tags.size >= 10) return false; 
            this.tags.set(tagName, new Tag(type));
        }
        return newTag;
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
