export type Analysis = {
  bugs: string[];
  complexity: string[];
  tests: string[];
};

export type LLMResponse = {
  explanation: string[];
  annotated: string;    // pełny kod z komentarzami
  refactor: string;     // zrefaktoryzowany kod
  analysis: Analysis;
};
