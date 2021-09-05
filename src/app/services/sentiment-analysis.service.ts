import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from './api.service';
import { environment } from 'src/environments/environment';
import { SentimentalAnalysis } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class SentimentAnalysisService {
  constructor(private apiService: ApiService) {}

  getAllTopStoriesList(): Observable<number[]> {
    return this.apiService.get(environment.hackerNewsServerUrl);
  }

  getHackerNewsStoryByStoryId(storyId: number) {
    return this.apiService.get(
      `${environment.hackerNewsItemUrl}/${storyId}.json`
    );
  }

  getSentimentalAnalysisByText(text: string): Observable<SentimentalAnalysis> {
    text = `text=${text}`;
    return this.apiService
      .post(environment.sentimentAnalysisServerUrl, text)
      .pipe(map(res => res.body));
  }
}
