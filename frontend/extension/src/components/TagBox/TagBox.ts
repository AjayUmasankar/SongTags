import { BackendNotifier } from '../BackendNotifier';


export class Tag {
    type: string;
    constructor (type: string = "default") {
        this.type = type;
    }
}
export class TagBox {
    href: string;

    divEl: Element;
    ul: HTMLUListElement;
    input: HTMLInputElement;

    maxTags: number;
    tags: Map<string, Tag>;


    constructor(href: string, uploader: string, songname: string) {
        // this = document.createElement('div');
        // let tagBoxDiv: Element = document.createElement('DIV');
        this.href = href; 
        this.divEl = document.createElement('DIV');
        this.divEl.classList.add("wrapper");
        this.divEl.addEventListener("click", (evt: any) => evt.stopPropagation()); // Or else we trigger youtubes click handler and enter the song
        this.divEl.innerHTML =
        `
        <div class = "content">
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

        this.tags = new Map<string, Tag>();
        this.maxTags = 10,
        BackendNotifier.getStorageTags(this.href).then(tagsString => {
            this.tags = new Map(Object.entries(JSON.parse(tagsString)));
            let tagsToAddUploader: Map<string, Tag> = this.addUploaderTags(uploader)
            let tagsToAddCategory: Map<string, Tag> = this.addCategoryTags(songname)

            let tagsToAdd = new Map ([...tagsToAddUploader, ...tagsToAddCategory])
            this.addTags(tagsToAdd);
        })
        this.input.addEventListener("keyup", this.addTagEvent.bind(this));
    }



    addCategoryTags(songName: string) {
        let tagsToAdd = new Map<string, Tag>();
        const nightcoreRegex = new RegExp('nightcore', 'i')
        if (nightcoreRegex.test(songName)) tagsToAdd.set("Nightcore", new Tag("category"));
        
        const tanocRegex = new RegExp('usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\+pazolite|RoughSketch|Kobaryo|P\*Light|nora2r|Relect|Getty|Tatsunoshin', 'i')
        if (tanocRegex.test(songName)) tagsToAdd.set("Tano*C", new Tag("category"));
        return tagsToAdd; 
    }
    addUploaderTags(uploader: string) {
        let tagsToAdd = new Map<string, Tag>();
        const topicRegex = new RegExp(' - Topic', 'i')

        if (topicRegex.test(uploader)) {
            tagsToAdd.set(uploader.slice(0, -8), new Tag("artist"));
        } else {
            tagsToAdd.set(uploader, new Tag("uploader"));
        }
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
        let hasNewTag = false;
        tagsToAdd.forEach((value, key) => {
            hasNewTag = this.addTag(key, value.type);
        })
        
        if(hasNewTag) {
            BackendNotifier.updateTagsForSong(this.href, this.tags);
        }
        this.rebuildTags(); // Need to do this for first time only to create tags on frontend
    }

    addTag(tagName: string, type: string = "default"): boolean {
        // Can have up to 10 tags. No duplicates. Minimum length = 1
        let hasNewTag = false;
        if(tagName.length > 1 && !this.tags.has(tagName)){
            hasNewTag = true;
            // console.log(tagName + "is new!");
            if(this.tags.size >= 10) return false; 
            this.tags.set(tagName, new Tag(type));
        }
        return hasNewTag;
        console.log(this.tags)
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
