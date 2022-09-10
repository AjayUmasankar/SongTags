class BackendNotifier {
    static tagsResource: string = "https://songtagsbackend.herokuapp.com/tags/ajay/" // for local uvicorn connection: "http://127.0.0.1:8000/tags/ajay/"

    static async updateTagsForSong(href: string, tags: Array<string>) {
        return await fetch(BackendNotifier.tagsResource+href, {
            method: 'POST',
            redirect: 'follow',
            mode: 'cors' as RequestMode,
            body: JSON.stringify(tags)
        }).then(response => {
            let responsetext = response.text() 
            return responsetext;
        }).catch(error => console.log('error', error)) || '[]';
    }

    static async getStorageTags(href: string) {
        /*
        fetch("http://127.0.0.1:8000/tags/ajay/KmDQuwJWs84", {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors'
        })
        */
        let getStorageTagsUrl = BackendNotifier.tagsResource + href
        let tagsString = await fetch(getStorageTagsUrl, {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors' as RequestMode
        }).then(response => {
            let responsetext = response.text() 
            return responsetext
        }).catch(error => console.log('error', error)) || '[]';
        return tagsString;
    }

}
