import { Injectable } from '@angular/core';
import { DataSourceService } from './dataSource.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionsService {
    private readonly baseUrl = "/api/subscriptions";
    constructor(private dataSourceService: DataSourceService) { }

    getAllUserPackages(): Observable<any> {
        return this.dataSourceService.getWithUserEmailInHeaderParam(`${this.baseUrl}`);
    }

    // get(id: string): Observable<any> {
    //     return this.dataSourceService.get(`${this.baseUrl}/${id}`);
    // }

    subscribeOnPackage(params: any) {
        return this.dataSourceService.postWithUserEmailInHeaderParam(`${this.baseUrl}/`, params);
    }

    // get(id: string): Observable<any> {
    //     return this.dataSourceService.get(`${this.baseUrl}/${id}`);
    // }

    // delete(id: string): Observable<any> {
    //     return this.dataSourceService.delete(`${this.baseUrl}/${id}`);
    // }

    // update(id: string, params: any) {
    //     return this.dataSourceService.put(`${this.baseUrl}/${id}`, params);
    // }

    // updateAll() {
    //     return this.dataSourceService.put(`${this.baseUrl}`);
    // }

    // create(params: any) {
    //     return this.dataSourceService.post(`${this.baseUrl}`, params);
    // }

    // fetchYoutubeData(youtubeUrl: string) {
    //     return this.dataSourceService.get(`${this.baseUrl}/youtube/metadata`, { youtubeUrl });
    // }

}
