import { Tag } from './TagBox/TagBox'

export class BackendNotifier {
    // static tagsResource: string = "https://songtagsbackend.herokuapp.com/tags/ajay/"
    static tagsResource: string = "http://127.0.0.1:8000/tags/ajay/"


    static async updateTagsForSong(href: string, tags: Map<string, Tag>) {
        const es6maptojson = JSON.stringify(Object.fromEntries(tags.entries()))
        return await fetch(BackendNotifier.tagsResource+href, {
            method: 'POST',
            redirect: 'follow',
            mode: 'cors' as RequestMode,
            body: es6maptojson
        }).then(response => {
            let responsetext = response.text() 
            return responsetext;
        }).catch(error => console.log('error', error)) || '{}';
    }

    static async getStorageTags(href: string) {
        let getStorageTagsUrl = BackendNotifier.tagsResource + href
        let tagsString = await fetch(getStorageTagsUrl, {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors' as RequestMode
        }).then(response => {
            let responsetext = response.text() 
            return responsetext
        }).catch(error => console.log('error', error)) || '{}';
        return tagsString;
    }

}
