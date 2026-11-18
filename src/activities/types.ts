export interface ActivityResult {
  correct: number;
  total: number;
  missed: string[]; // mots à revoir
}

export interface ActivityProps {
  onDone: (r: ActivityResult) => void;
}
