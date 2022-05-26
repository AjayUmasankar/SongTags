"use strict";
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
        this.ul = this.divEl.querySelector("ul"),
            this.input = this.divEl.querySelector("input"),
            // this.tagNumb = tagDiv.querySelector(".details span");
            this.maxTags = 10,
            this.tags = [];
        this.countTags();
        this.createTag();
        this.input.addEventListener("keyup", this.addTag.bind(this));
        // this.removeBtn = document.querySelector(".details button");
        // this.removeBtn.addEventListener("click", () =>{
        //     this.tags.length = 0;
        //     this.ul.querySelectorAll("li").forEach(li => li.remove());
        //     this.countTags();
        // });
        console.log('AFter constructor Tags is:', this.tags);
    }
    countTags() {
        this.input.focus();
        // this.tagNumb.innerText = this.maxTags - this.tags.length;
    }
    createTag() {
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
        this.countTags();
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
        this.countTags();
    }
    addTag(e) {
        if (!this.tags)
            this.tags = [];
        console.log('Tags is:', this.tags);
        console.log(e.target);
        let inputEl = e.target;
        if (e.key == "Enter") {
            let tag = inputEl.value.replace(/\s+/g, ' ');
            if (tag.length > 1 && !this.tags.includes(tag)) {
                if (this.tags.length < 10) {
                    tag.split(',').forEach(tag => {
                        this.tags.push(tag);
                        this.createTag();
                    });
                }
            }
            inputEl.value = "";
        }
    }
}
//# sourceMappingURL=tagBox.js.map