import * as utilities from "../utilities.js";
import * as serverVariables from "../serverVariables.js";
import {log} from "../log.js";
let cashedRquestsExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");

// Repository file data models cache
globalThis.CashedRquests = [];
export default class CachedRequestManager{
    static add(url, content, ETag = ""){
        /*mise en cache*/
        if (url != "") {
            CachedRequestManager.clear(url);
            CashedRquests.push({
                url,
                content,
                ETag,
                Expire_Time: utilities.nowInSeconds() + cashedRquestsExpirationTime
            });
            console.log(url + " added to the requests cache");
        }
    }

    static find(url){
        /* return cache associated to url*/
        try {
            if (url != "") {
                for (let endpoint of CashedRquests) {
                    if (endpoint.url == url) {
                        // renew cache
                        endpoint.Expire_Time = utilities.nowInSeconds() + cashedRquestsExpirationTime;
                        console.log(url + " retreived from requests cache");
                        return endpoint.data;
                    }
                }
            }
        } catch (error) {
            console.log("request cache error!", error);
        }
        return null;
    }

    static clear(url){
        /*delete associated cache*/
        if (url != "") {
            let indexToDelete = [];
            let index = 0;
            for (let endpoint of CashedRquests) {
                if(endpoint.url.toLowerCase().indexOf(url.toLowerCase()) > -1)
                    indexToDelete.push(index);
                index++;
            }
            utilities.deleteByIndex(CashedRquests, indexToDelete);
        }
    }

    static flushExpired(){
        /* delete expired caches */
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for (let endpoint of CashedRquests) {
            if (endpoint.Expire_Time < now) {
                console.log("Cached url " + endpoint.url + " expired");
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(CashedRquests, indexToDelete);
    }

    static get(HttpContext){
        /* 
        Chercher la cache correspondant à l'url de la requête. Si trouvé,
        Envoyer la réponse avec
        HttpContext.response.JSON( paylod, ETag, true /* from cache 
                Note: Show on console->
        */
       for(let endpoint of CashedRquests){
            if(endpoint.url == HttpContext.req.url){
                HttpContext.response.JSON(HttpContext.payload, endpoint.ETag, true);
                console.log("CashedRequests get successful for " + endpoint.url + "," + HttpContext.req.url);
            }      
       }
    }
}
/*(Inspirez-vous de la classe RepositoryCachesManager)*/
//setInterval(CachedRequestManager.flushExpired, cashedRquestsExpirationTime * 1000);
log(BgWhite, FgBlack, "Periodic repository caches cleaning process started...");