import { TagService } from '../../TagService';
import { logger } from '../../logger'

import styles from "./TagBoxAddButton.module.scss"

export class Tag {
    name: string;
    type: string;
    date: string;
    priority: number;
    constructor (name: string, type: string = "normal", date: string = new Date().toISOString()) {
        this.name = name;
        this.type = type;
        this.date = date;
        this.priority = 500
    }
}

export class TagBox {
    userEmail: string;
    songId: string;
    tags: Map<string, Tag>;

    divEl = document.createElement('div');
    inputEl: HTMLInputElement;

    constructor (userEmail: string, songId:string, tags: Map<string, Tag> = new Map<string, Tag>()) {
        this.userEmail = userEmail
        this.songId = songId
        this.tags = tags

        // Setup the div and input element 
        this.divEl.classList.add("tagbox");
        this.divEl.addEventListener("click", (evt: any) => evt.stopPropagation()); // Or else we trigger youtubes click handler and enter the song on playlist page
        this.divEl.innerHTML = 
        `
        <div class="${styles['text-input']}">
            <input type="text" id="` + songId + `">
            <label for="` + songId + `" class=${styles['taglabel']}>+</label>
        </div>
        `
        this.inputEl = this.divEl.querySelector("input") as HTMLInputElement,
        this.inputEl.addEventListener("keyup", this.addTag.bind(this));

        // First render of the tags
        tags.forEach(tag => this.addTagFrontend(tag))
    }

    async addTag(e:KeyboardEvent) {
        if (e.key !== 'Enter') return;
        let inputEl = e.target as HTMLInputElement;
        let tagName = inputEl.value.replace(/\s+/g, ' ');
        let tag: Tag = await TagService.setTag(this.userEmail, this.songId, tagName) 
        if(this.tags.has(tag.name)) return
        logger.info("Adding tag: ", tag)
        this.addTagFrontend(tag)
    }

    addTagFrontend(tag: Tag) {
        let anchorTag: HTMLAnchorElement = document.createElement('a');
        anchorTag.href = "javascript:;";
        anchorTag.classList.add("pill");
        anchorTag.classList.add(tag.type); // will be used to give different color to tags
        anchorTag.innerHTML = `\#${tag.name} `
        let deleteTagBound = this.deleteTag.bind(this);
        anchorTag.addEventListener('click', (evt) => deleteTagBound(evt, tag.name));
        this.divEl.insertAdjacentElement("afterbegin", anchorTag);
    }

    async deleteTag(evt:MouseEvent, tagName: string){
        let element = evt.target as Element;
        console.log('Removing tag element:', element);
        if(!element) return;
        this.tags.delete(tagName)
        element.remove();
        TagService.deleteTag(this.userEmail, this.songId, tagName);
    }
}