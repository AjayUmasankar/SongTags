class tagBox {
    ul: HTMLUListElement;
    input: HTMLInputElement;
    maxTags: number;
    tags: Array<string>;
    href: string;
    divEl: Element;
    static tagsResource: string = "https://songtagsbackend.herokuapp.com/tags/ajay/" // for local uvicorn connection: "http://127.0.0.1:8000/tags/ajay/"


    constructor(href: string) {
        // this = document.createElement('div');
        // let tagBoxDiv: Element = document.createElement('DIV');
        this.href = href; 
        this.divEl = document.createElement('DIV');
        this.divEl.classList.add("wrapper");
        this.divEl.addEventListener("click", (evt: any) => evt.stopPropagation());
        this.divEl.innerHTML =
        `
            <div class="content">
                <ul><input type="text" spellcheck="false" onkeydown="this.style.width = ((this.value.length + 1) * 1) + 'ch';" style="width:50px"></ul>
            </div>
        ` 
        this.tags = [];
        this.getStorageTags().then(tagsString => {
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

    async getStorageTags() {
        /*
        fetch("http://127.0.0.1:8000/tags/ajay/KmDQuwJWs84", {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors'
        })
        */
        let getStorageTagsUrl = tagBox.tagsResource + this.href
        let tagsString = await fetch(getStorageTagsUrl, {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors' as RequestMode
        }).then(response => {
            let responsetext = response.text() 
            return responsetext
        }).catch(error => console.log('error', error)) || '[]';
        return tagsString;
        // return chrome.storage.local.get(href, (items) => {
        //     this.tags = items[href] ?? [];
        //     this.rebuildTags();
        // });
    }

    async updateBackend()  {
        return await fetch(tagBox.tagsResource+this.href, {
            method: 'POST',
            redirect: 'follow',
            mode: 'cors' as RequestMode,
            body: JSON.stringify(this.tags)
        }).then(response => {
            let responsetext = response.text() 
            return responsetext;
        }).catch(error => console.log('error', error)) || '[]';

        // let key = this.href;
        // let value = this.tags;
        // var kvObj : any = {};
        // kvObj[key] = value;
        // return await chrome.storage.local.set(kvObj);
        // console.log(await this.getCurrentTags());
        // this.tagNumb.innerText = this.maxTags - this.tags.length;
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
        this.updateBackend();
    }

    removeTag(evt:MouseEvent, tag: string){
        let element = evt.target as Element;
        console.log('Removing tag element:', element);
        if(!element) return;
        let index: number  = this.tags.indexOf(tag);
        this.tags = [...this.tags.slice(0, index), ...this.tags.slice(index + 1)];
        element.remove();
        this.updateBackend();
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




