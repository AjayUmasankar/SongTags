"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class tagBox {
    constructor(href) {
        // this = document.createElement('div');
        // let tagBoxDiv: Element = document.createElement('DIV');
        this.href = href;
        this.divEl = document.createElement('DIV');
        this.divEl.innerHTML =
            `<div class="content">
            <ul><input type="text" spellcheck="false"></ul>
        </div>
        `;
        this.getStorageTags();
        this.ul = this.divEl.querySelector("ul"),
            this.input = this.divEl.querySelector("input"),
            // this.tagNumb = tagDiv.querySelector(".details span");
            this.maxTags = 10,
            this.tags = [];
        //this.rebuildTags();
        this.input.addEventListener("keyup", this.addTag.bind(this));
        // this.removeBtn = document.querySelector(".details button");
        // this.removeBtn.addEventListener("click", () =>{
        //     this.tags.length = 0;
        //     this.ul.querySelectorAll("li").forEach(li => li.remove());
        //     this.countTags();
        // });
        // console.log('After constructor Tags is:', this.tags);
    }
    getStorageTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const href = this.href;
            return chrome.storage.local.get(href, (items) => {
                console.log(items);
                console.log(items.key);
                console.log(items.href);
                console.log(items[href]);
                this.tags = items[href];
                this.rebuildTags();
            });
        });
    }
    updateStorageTags() {
        return __awaiter(this, void 0, void 0, function* () {
            //this.input.focus();
            //console.log(await this.setCurrentTags());
            let key = this.href;
            // let value = new Array<string>("Touhou");
            let value = this.tags;
            var kvObj = {};
            kvObj[key] = value;
            return yield chrome.storage.local.set(kvObj);
            //console.log(await this.getCurrentTags());
            // this.tagNumb.innerText = this.maxTags - this.tags.length;
        });
    }
    // Rebuilds the whole whole tag list!
    rebuildTags() {
        console.log('Creating Tags!');
        this.ul = this.ul;
        this.ul.querySelectorAll("li").forEach(li => li.remove());
        this.tags.slice().reverse().forEach(tag => {
            let liTag = document.createElement('li');
            // liTag.outerHTML = `<li>${tag} <i class="uit uit-multiply"></i></li>`;
            liTag.innerHTML = `${tag} <i class="uit uit-multiply"></i>`;
            // let liTag = `<li>${tag} <i class="uit uit-multiply"></i></li>`;
            let removeTagBound = this.removeTag.bind(this);
            liTag.addEventListener('click', (evt) => removeTagBound(evt, tag));
            this.ul.insertAdjacentElement("afterbegin", liTag);
        });
    }
    removeTag(evt, tag) {
        console.log(evt);
        let element = evt.target;
        console.log('Removing tag element:', element);
        if (!element)
            return;
        let index = this.tags.indexOf(tag);
        this.tags = [...this.tags.slice(0, index), ...this.tags.slice(index + 1)];
        // console.log('Removing Element:', element.parentElement);
        element.remove();
        this.updateStorageTags();
        this.getStorageTags();
    }
    // Add one single tag
    addTag(e) {
        if (e.key !== 'Enter')
            return;
        if (!this.tags)
            this.tags = [];
        console.log('Tags is:', this.tags);
        //console.log(e.target);
        let inputEl = e.target;
        if (e.key == "Enter") {
            let tag = inputEl.value.replace(/\s+/g, ' ');
            if (tag.length > 1 && !this.tags.includes(tag)) {
                if (this.tags.length < 10) {
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
//# sourceMappingURL=tagBox.js.map