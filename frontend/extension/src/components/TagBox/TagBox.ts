import { BackendNotifier } from '../BackendNotifier';

export class TagBox {
    ul: HTMLUListElement;
    input: HTMLInputElement;
    maxTags: number;
    tags: Array<string>;
    href: string;
    divEl: Element;

    constructor(href: string) {
        // this = document.createElement('div');
        // let tagBoxDiv: Element = document.createElement('DIV');
        this.href = href; 
        this.divEl = document.createElement('DIV');
        this.divEl.classList.add("wrapper");
        this.divEl.addEventListener("click", (evt: any) => evt.stopPropagation()); // Or else we trigger youtubes click handler and enter the song
        this.divEl.innerHTML =
        // `
        //     <div class="content">
        //         <ul><input type="text" spellcheck="false" onkeydown="this.style.width = ((this.value.length + 1) * 1) + 'ch';" style="width:50px"></ul>
        //     </div>
        // ` 

        `
        <div class = "content">
            <ul> </ul>
            <div class="text-input">
                <input type="text" id="` + href + `" placeholder="">
                <label for="` + href + `" class=taglabel>+</label>
            </div>
        </div>
        `
        this.tags = [];
        BackendNotifier.getStorageTags(this.href).then(tagsString => {
            this.tags = JSON.parse(tagsString)
            this.rebuildTags()
        })

        this.ul = this.divEl.querySelector("ul") as HTMLUListElement,
        this.input = this.divEl.querySelector("input") as HTMLInputElement,
        this.maxTags = 10,

        this.input.addEventListener("keyup", this.addTag.bind(this));
        // this.removeBtn = document.querySelector(".details button");
        // this.removeBtn.addEventListener("click", () =>{
        //     this.tags.length = 0;
        //     this.ul.querySelectorAll("li").forEach(li => li.remove());
        //     this.countTags();
        // });
        // console.log('After constructor Tags is:', this.tags);
    }



    // Reads input field and adds the tag
    addTag(e:KeyboardEvent){
        if (e.key !== 'Enter') return;
        //if (!this.tags) this.tags = [];
        //console.log('Tags is:', this.tags);
        //console.log(e.target);
        let inputEl = e.target as HTMLInputElement;
        if(e.key != "Enter") return; 

        // Can have up to 10 tags. No duplicates. Minimum length = 1
        let tag = inputEl.value.replace(/\s+/g, ' ');
        if(tag.length > 1 && !this.tags.includes(tag)){
            if(this.tags.length >= 10) return; 
            tag.split(',').forEach(tag => {
                this.tags.push(tag);
                this.rebuildTags();
            });
        }
        inputEl.value = "";
        BackendNotifier.updateTagsForSong(this.href, this.tags);
        // this.updateTagsForSong(this.href, this.tags);
    }

    removeTag(evt:MouseEvent, tag: string){
        let element = evt.target as Element;
        console.log('Removing tag element:', element);
        if(!element) return;
        let index: number  = this.tags.indexOf(tag);
        this.tags = [...this.tags.slice(0, index), ...this.tags.slice(index + 1)];
        element.remove();
        BackendNotifier.updateTagsForSong(this.href, this.tags);
    }

    // Rebuilds the tag box contents for the associated href
    rebuildTags(){
        this.ul.querySelectorAll("li").forEach(li => li.remove());
        if(this.tags.length == 0) return; // or else the slice below causes errors
        this.tags.slice().reverse().forEach(tag =>{

            let liTag: HTMLLIElement = document.createElement('li');
            liTag.innerHTML = `${tag}`
            // let liTag = `<li>${tag} <i class="uit uit-multiply"></i></li>`; # if you need the X
            let removeTagBound = this.removeTag.bind(this);
            liTag.addEventListener('click', (evt) => removeTagBound(evt,tag));
            this.ul.insertAdjacentElement("afterbegin", liTag);
        });
    }
}




