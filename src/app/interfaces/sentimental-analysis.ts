export interface SentimentalAnalysis {
  lang: string;
  mid: number;
  mid_percent: string;
  neg: number;
  neg_percent: string;
  pos: number;
  pos_percent: string;
  text: string;
  totalLines: number;
}
