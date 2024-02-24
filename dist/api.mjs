import { RESTDataSource } from '@apollo/datasource-rest';
export class DataAPI extends RESTDataSource {
    constructor() {
        super(...arguments);
        this.baseURL = 'http://localhost:8082/api/v1/';
    }
    async getData() {
        return this.get(`course/scheduledshortcourses`);
        // all_categories
    }
    cacheOptionsFor() {
        return {
            ttl: 100000
        };
    }
    async fetch(path, incomingRequest = {}) {
        const result = await super.fetch(path, incomingRequest);
        //await result.response.headers.delete('cache-control');
        //await result.response.headers.delete('transfer-encoding');
        //await result.response.headers.delete('connection');
        //await result.response.headers.delete('x-ratelimit-limit');
        //await result.response.headers.delete('x-ratelimit-remaining');
        //result.response.headers.set('cache-control', 'max-age=36000, public');
        //await result.response.headers.append('cache-control', 'max-age=36000, public');
        //await result.response.headers.de
        console.log(">>>>>>>>>>>>>>>", result.response);
        return result;
    }
}
