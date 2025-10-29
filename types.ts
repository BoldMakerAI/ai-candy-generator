export interface Candy {
  name: string;
  imageUrl: string;
}

export interface CandyRequest {
  keywords: string;
  candyType: string;
}

export enum CandyType {
  Gummy = 'Gummy',
  HardCandy = 'Hard Candy',
  Chocolate = 'Chocolate',
  Lollipop = 'Lollipop',
}