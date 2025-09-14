export type Analysis = {
  bugs: string[];
  complexity: string[];
  tests: string[];
};

export type LLMResponse = {
  explanation: string[];
  annotated: string;   
  refactor: string;     
  analysis: Analysis;
};

export type ExplainLevel = "junior" | "mid" | "senior";
