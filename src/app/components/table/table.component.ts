import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, combineLatest, forkJoin, Subscription } from 'rxjs';
import {
  map,
  debounceTime,
  startWith,
  distinctUntilChanged,
  switchMap,
  tap
} from 'rxjs/operators';

import * as _ from 'lodash';

import { SentimentAnalysisService } from 'src/app/services';
import { SentimentalAnalysis, TableColumns } from 'src/app/interfaces';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  columns: TableColumns[] = [
    {
      field: 'sNo',
      header: 'SNO',
      width: '100px'
    },
    {
      field: 'newsTitle',
      header: 'News Title',
      width: '300px'
    },
    {
      field: 'sentimentAnalysisResult',
      header: 'Sentiment Analysis Result',
      width: '300px',
      showDropdown: true,
      dropdownConfig: [
        { text: 'Positive', value: 'Positive' },
        { text: 'Negative', value: 'Negative' }
      ]
    }
  ];

  totalRows: number;
  scrollConfig: { x: string; y: string } = { x: '700px', y: '440px' };
  tableSize = 'middle';
  data: Array<{
    sNo: number;
    newsTitle: string;
    sentimentAnalysisResult: string;
  }> = [];
  loading = true;
  isServerSidePagination = true;
  pageIndex = 1;
  pageSize = 10;
  idsOfTopStories: number[];

  tableData$ = new BehaviorSubject(null);
  loadSentimentAnalysisSubject$ = new BehaviorSubject(null);
  searchFormControl = new FormControl('');
  searchFormControlSubscription: Subscription;
  tableDataSubscription: Subscription;

  constructor(private sentimentAnalysisService: SentimentAnalysisService) {}

  ngOnInit() {
    this.searchFormControlSubscription = this.searchFormControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(500),
        distinctUntilChanged(),
        map(term =>
          this.tableData$.next(
            _.filter(this.data, item =>
              _.includes(_.toLower(item.newsTitle), _.toLower(term))
            )
          )
        )
      )
      .subscribe();

    this.tableDataSubscription = combineLatest([
      this.sentimentAnalysisService.getAllTopStoriesList(),
      this.loadSentimentAnalysisSubject$
    ])
      .pipe(
        tap(([idsOfTopStories]) => (this.idsOfTopStories = idsOfTopStories)),
        switchMap(() =>
          forkJoin(
            _.map(this.getPaginatedStoryIds(), storyId =>
              this.sentimentAnalysisService.getHackerNewsStoryByStoryId(storyId)
            )
          ).pipe(
            switchMap(stories =>
              forkJoin(
                _.map(stories, story =>
                  this.sentimentAnalysisService.getSentimentalAnalysisByText(
                    story.title
                  )
                )
              ).pipe(
                map((sentimentalAnalysisResponse: SentimentalAnalysis[]) => {
                  this.loading = false;
                  this.totalRows = this.idsOfTopStories.length;
                  this.data = _.map(
                    sentimentalAnalysisResponse,
                    (sentimentalAnalysis, index) => ({
                      sNo: index + 1,
                      newsTitle: sentimentalAnalysis.text,
                      sentimentAnalysisResult:
                        sentimentalAnalysis.pos >= sentimentalAnalysis.neg
                          ? 'Positive'
                          : 'Negative'
                    })
                  );
                  this.tableData$.next(this.data);
                  return this.data;
                })
              )
            )
          )
        )
      )
      .subscribe();
  }

  onPaginationChange() {
    this.loading = true;
    this.loadSentimentAnalysisSubject$.next(null);
  }

  onFilterChange(values: string[]) {
    if (values.length === 2 || !values.length) {
      this.tableData$.next(this.data);
    } else if (values.length === 1) {
      this.tableData$.next(
        _.filter(this.data, data => data.sentimentAnalysisResult === values[0])
      );
    }
  }

  ngOnDestroy() {
    if (this.searchFormControlSubscription) {
      this.searchFormControlSubscription.unsubscribe();
    }

    if (this.tableDataSubscription) {
      this.tableDataSubscription.unsubscribe();
    }
  }

  private getPaginatedStoryIds() {
    return (
      this.idsOfTopStories &&
      this.idsOfTopStories.slice(
        (this.pageIndex - 1) * this.pageSize,
        this.pageIndex * this.pageSize
      )
    );
  }
}
