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

export type CopyStructureAnalysis = {
  mainCopy: string;
  subCopy: string;
  mainPattern: string;
  subPattern: string;
  variableMap: string[];
  adaptationGuide: string[];
};

export type DesignIntentAnalysis = {
  copyEmphasis: string[];
  clickIntent: string[];
  visualHierarchy: string[];
};

export type AnalysisReport = {
  copyBreakdown: CopyStructureAnalysis;
  designIntent: DesignIntentAnalysis;
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
