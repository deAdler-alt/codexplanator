// lib/detect/language.ts
export type Lang =
  | "python"
  | "typescript"
  | "javascript"
  | "java"
  | "cpp"
  | "c"
  | "go";

export function detectLanguage(code: string): Lang {
  const src = (code || "").slice(0, 5000);
  const has = (re: RegExp) => re.test(src);

  // Python
  let pyScore = 0;
  if (has(/\bdef\s+\w+\s*\(/)) pyScore += 3;
  if (has(/:\s*(#.*)?\n/)) pyScore += 1;
  if (has(/\bself\b/)) pyScore += 1;
  if (has(/\bNone\b|\bTrue\b|\bFalse\b/)) pyScore += 1;
  if (has(/\belif\b|\bexcept\b|\blambda\b/)) pyScore += 1;
  if (has(/^\s*print\(/m) && !has(/;$/m)) pyScore += 1;

  // TypeScript
  let tsScore = 0;
  if (has(/\binterface\s+\w+/)) tsScore += 3;
  if (has(/\btype\s+\w+\s*=/)) tsScore += 2;
  if (has(/\benum\s+\w+/)) tsScore += 2;
  if (has(/:\s*(string|number|boolean|unknown|any|void|never|Record|Array)<?/)) tsScore += 2;
  if (has(/\bimplements\b|\breadonly\b|\bprivate\b|\bpublic\b|\bprotected\b/)) tsScore += 1;

  // JavaScript
  let jsScore = 0;
  if (has(/\bfunction\s+\w+\s*\(|=>/)) jsScore += 2;
  if (has(/\b(module\.exports|require\(|export\s+(default|const|function))/)) jsScore += 2;
  if (has(/\bconst\b|\blet\b/)) jsScore += 1;

  // Go
  let goScore = 0;
  if (has(/\bpackage\s+\w+/)) goScore += 2;
  if (has(/\bfunc\s+\w+\s*\(/)) goScore += 2;
  if (has(/\:=/)) goScore += 1;
  if (has(/\bfmt\./)) goScore += 1;
  if (has(/\bdefer\b/)) goScore += 1;

  // Java
  let javaScore = 0;
  if (has(/\bpublic\s+class\s+\w+/)) javaScore += 2;
  if (has(/\bstatic\s+void\s+main\s*\(/)) javaScore += 2;
  if (has(/\bimport\s+java\./)) javaScore += 1;
  if (has(/@Override/)) javaScore += 1;

  // C
  let cScore = 0;
  if (has(/#include\s*<stdio\.h>/)) cScore += 3;
  if (has(/\bint\s+main\s*\(\s*void?\s*\)/)) cScore += 2;
  if (has(/\bprintf\s*\(/)) cScore += 1;

  // C++
  let cppScore = 0;
  if (has(/#include\s*<iostream>/)) cppScore += 3;
  if (has(/\bstd::/)) cppScore += 2;
  if (has(/\busing\s+namespace\s+std\b/)) cppScore += 1;
  if (has(/\btemplate\s*<.*>/)) cppScore += 1;

  const scores: Array<[Lang, number]> = [
    ["python", pyScore],
    ["typescript", tsScore],
    ["javascript", jsScore],
    ["go", goScore],
    ["java", javaScore],
    ["c", cScore],
    ["cpp", cppScore],
  ];

  scores.sort((a, b) => b[1] - a[1]);
  const top = scores[0];
  if (top[1] <= 0) return "javascript";
  return top[0];
}
