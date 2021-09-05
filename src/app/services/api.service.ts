import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get = (url: string, params: HttpParams = new HttpParams()): Observable<any> =>
    this.http.get(url, {
      params
    });

  post = (
    url: string,
    body: any,
    params: HttpParams = new HttpParams()
  ): Observable<any> =>
    this.http.post(url, body, {
      params,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': 'text-sentiment.p.rapidapi.com',
        'x-rapidapi-key': 'f3e47b6a41msh60785fdbf7db177p1d1b20jsn1345602ea693'
      },
      observe: 'response'
    });
}
