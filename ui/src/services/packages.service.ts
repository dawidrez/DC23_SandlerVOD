import { Injectable } from '@angular/core';
import { DataSourceService } from './dataSource.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PackagesService {
    private readonly baseUrl = "/api/packages";
    constructor(private dataSourceService: DataSourceService) { }

    getAll(): Observable<any> {
        return this.dataSourceService.get(`${this.baseUrl}`);
    }

    get(id: string): Observable<any> {
        return this.dataSourceService.get(`${this.baseUrl}/${id}`);
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
