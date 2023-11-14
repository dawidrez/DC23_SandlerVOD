import { Injectable } from '@angular/core';
import { DataSourceService } from './dataSource.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RaportService {
    private readonly baseUrl = "/api/";
    constructor(private dataSourceService: DataSourceService) { }

    generate(params: any): Observable<any> {
        return this.dataSourceService.getFile(`${this.baseUrl}generate_report/`, params);
    }
}
