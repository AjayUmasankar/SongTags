import { Tag } from './components/TagBox/TagBox'
import { logger } from './logger'

export class TagService {
    // static endpoint: string = "https://songtags-production.up.railway.app"
    static endpoint: string = "http://localhost:8000"

    static async getEndpoint() {
        const healthUrl = `${TagService.endpoint}/`
        const res: Response = await TagService.get(healthUrl)
        if(res.type == "error") {
            logger.warn(`Local API not found, using Railway at : https://songtags-production.up.railway.app`)
            TagService.endpoint = "https://songtags-production.up.railway.app";
        }
    }

    static async getTags(userEmail: string, songId:string, songName:string, playlistId:string, playlistName:string, uploader:string = ""): Promise<Map<string, Tag>> {
        const url = `${TagService.endpoint}/tags/${userEmail}/${songId}?uploader=${uploader}&song_name=${songName}&playlist_name=${playlistName}&playlist_id=${playlistId}`
        return await TagService.get(url).then(res => res.json())
        .then((tagsObj) => {
            const tagsMap: Map<string,Tag> = new Map(Object.entries(tagsObj));
            // logger.info("Recieved tagsObj which was converted into tagsMap", tagsObj, tagsMap)
            return tagsMap
        })
    }
    static async setTag(userEmail: string, songId:string, tagName: string): Promise<Tag> {
        const url = `${TagService.endpoint}/tags/${userEmail}/${songId}/${tagName}`
        return await TagService.post(url).then(res => res.json())
    }
    static async deleteTag(userEmail: string, songId:string, tagName: string): Promise<Tag> {
        const url = `${TagService.endpoint}/tags/${userEmail}/${songId}/${tagName}`
        return await TagService.delete(url).then(res => res.json())
    }




    static async get(path: string): Promise<Response> {
        const params: RequestInit = {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors' as RequestMode
        };
        return TagService.fetchWithErrorHandling(path, params)
    }
    static async post(path: string, body?: any): Promise<Response> {
        const params: RequestInit = {
            method: "POST",
            redirect: 'follow',
            mode: 'cors' as RequestMode
        };
        if (body) {
            params.headers = {
                "content-type": "application/json",
            };
            params.body = JSON.stringify(body);
        }
        return TagService.fetchWithErrorHandling(path, params)
    }
    static async delete(path: string, body?: any): Promise<Response> {
        const params: RequestInit = {
            method: "DELETE",
            redirect: 'follow',
            mode: 'cors' as RequestMode
        };
        if (body) {
            params.headers = {
                "content-type": "application/json",
            };
            params.body = JSON.stringify(body);
        }
        return TagService.fetchWithErrorHandling(path, params)
    }
    static async fetchWithErrorHandling(path:string, params:any) {
        try {
            const response: Response = await fetch(path, params);
            if(!response.ok) throw response
            return response;
        } catch (error) {
            logger.error(error, `${params.method} request failed!`)
            return Response.error();
        }
    }
}
