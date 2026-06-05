export type OptionLabel = 'A' | 'B' | 'C';

export type ThumbnailOption = {
  label: OptionLabel;
  name: string;
  headline: string;
  subline: string;
  designDirection: string;
  prompt: string;
};

export type GeneratedOption = ThumbnailOption & {
  imageUrl: string;
};

export type AnalysisReport = {
  copyStructure: string[];
  designStyle: string[];
  transferRules: string[];
  cautionNotes: string[];
  summary: string;
  options: ThumbnailOption[];
};

export type AnalyzeRequest = {
  topic: string;
  tone?: string;
  copyImage: string;
  designImage: string;
};
