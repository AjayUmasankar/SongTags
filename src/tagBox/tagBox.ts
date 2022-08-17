class tagBox {
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
        this.divEl.innerHTML=
        `<div class="content">
            <ul><input type="text" spellcheck="false"></ul>
        </div>
        ` 
        this.tags = [];
        this.getStorageTags();
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


    async getStorageTags() {
        const href = this.href;
        return chrome.storage.local.get(href, (items) => {
            this.tags = items[href] ?? [];
            this.rebuildTags();
        });
    }

    async updateStorageTags()  {
        //this.input.focus();
        //console.log(await this.setCurrentTags());
        let key = this.href;
        // let value = new Array<string>("Touhou");
        let value = this.tags;
        var kvObj : any = {};
        kvObj[key] = value;
        return await chrome.storage.local.set(kvObj);
        //console.log(await this.getCurrentTags());
        // this.tagNumb.innerText = this.maxTags - this.tags.length;
    }
    
    // Rebuilds the tag box contents for the associated href
    rebuildTags(){
        console.log('Creating Tags!');
        //this.ul = this.ul;
        this.ul.querySelectorAll("li").forEach(li => li.remove());
        if(this.tags.length == 0) return; // or else the slice below causes errors
        this.tags.slice().reverse().forEach(tag =>{

            let liTag = document.createElement('li');
            // liTag.outerHTML = `<li>${tag} <i class="uit uit-multiply"></i></li>`;
            liTag.innerHTML = `${tag} <i class="uit uit-multiply"></i>`
            // let liTag = `<li>${tag} <i class="uit uit-multiply"></i></li>`;
            let removeTagBound = this.removeTag.bind(this);
            liTag.addEventListener('click', (evt) => removeTagBound(evt,tag));
            this.ul.insertAdjacentElement("afterbegin", liTag);
        });
    }
    removeTag(evt:MouseEvent, tag: string){
        //console.log(evt);
        let element = evt.target as Element;
        console.log('Removing tag element:', element);
        if(!element) return;
        let index  = this.tags.indexOf(tag);
        this.tags = [...this.tags.slice(0, index), ...this.tags.slice(index + 1)];
        // console.log('Removing Element:', element.parentElement);
        element.remove();
        this.updateStorageTags();
        //this.getStorageTags();
    }

    // Add one single tag
    addTag(e:KeyboardEvent){
        if (e.key !== 'Enter') return;
        //if (!this.tags) this.tags = [];
        console.log('Tags is:', this.tags);
        //console.log(e.target);
        let inputEl = e.target as HTMLInputElement;
        if(e.key == "Enter"){
            let tag = inputEl.value.replace(/\s+/g, ' ');
            if(tag.length > 1 && !this.tags.includes(tag)){
                if(this.tags.length < 10){
                    tag.split(',').forEach(tag => {
                        this.tags.push(tag);
                        this.rebuildTags();
                    });
                }
            }
            inputEl.value = "";
        }
        this.updateStorageTags();
    }


}




