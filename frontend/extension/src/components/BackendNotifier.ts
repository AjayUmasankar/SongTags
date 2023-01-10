import { TagData } from './TagBox/TagBox'

export class BackendNotifier {
    //static tagsResource: string = "https://songtagsbackend.herokuapp.com/tags/ajay/"
    // static ajayTagsEndpoint: string = "http://127.0.0.1:8000/tags/ajay/"
    static tagsEndpoint: string = "http://127.0.0.1:8000/tags"


    static async updateTagsForSong(username:string, href: string, tags: Map<string, TagData>) {
        const es6maptojson = JSON.stringify(Object.fromEntries(tags.entries()))
        return await fetch(BackendNotifier.tagsEndpoint+"/"+username+"/"+href, {
            method: 'POST',
            redirect: 'follow',
            mode: 'cors' as RequestMode,
            body: es6maptojson
        }).then(response => {
            let responsetext = response.text() 
            return responsetext;
        }).catch(error => console.log('error', error)) || '{}';
    }

    static async getTags(username: string, href:string, uploader:string, songname:string, playlistName:string) {
        const getTagsUrl = `${BackendNotifier.tagsEndpoint}/${username}/${href}/?uploader=${uploader}&songname=${songname}&playlistName=${playlistName}`
        let tagsString = await fetch(getTagsUrl, {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors' as RequestMode,
            // Dont pass in body into GET params, some framewokrs dont play nice with it
        }).then(response => {
            let responsetext = response.text() 
            return responsetext
        }).catch(error => console.log('error', error)) || '{}';
        return tagsString;
    }
}
