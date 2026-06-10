const { readFileSync, readdirSync, writeFileSync } = require("node:fs");
const { execSync } = require("node:child_process");
const { resolve, join, sep } = require("node:path");

const LANG_PATH = "./packages/client/src/languages";
const EN_FILE_PATH = `${LANG_PATH}/en.ts`;
const SOURCE_PATH = "./packages/";

const sourceFilePaths = getAllFiles(SOURCE_PATH)
   .filter((f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.endsWith(".d.ts") && !f.split(sep).includes("languages"));

const sourceFileContents = sourceFilePaths.map((f) => readFileSync(f, { encoding: "utf8" }));

console.log("🟡 Check Localization Argument Count");

const enContent = readFileSync(EN_FILE_PATH, { encoding: "utf8" })
   .replace("export const EN =", "")
   .replace("};", "}");
// biome-ignore lint/security/noGlobalEval: <explanation>
const sourceTranslations = eval(`(${enContent})`);

let tokenError = false;

// Validation 1: Token consecutiveness (min=1, no gaps) and key-content token match
console.log("🟡 Validate Token Consecutiveness and Key-Content Token Match");
for (const [key, value] of Object.entries(sourceTranslations)) {
   if (key.startsWith("$$")) continue;

   const contentTokens = extractTokens(value);
   const keyTokens = extractTokens(key);

   if (contentTokens.length === 0) continue;

   // Check min=1
   const min = Math.min(...contentTokens);
   if (min !== 1) {
      console.log(`❌ Tokens must start from \$1: ${key} = "${value}"`);
      tokenError = true;
   }

   // Check no gaps
   const unique = new Set(contentTokens);
   const max = Math.max(...contentTokens);
   if (unique.size !== max) {
      for (let i = 1; i <= max; i++) {
         if (!unique.has(i)) {
            console.log(`❌ Missing token \$${i} in: ${key} = "${value}"`);
            tokenError = true;
         }
      }
   }

   // Check key name tokens match content tokens in order
   const keyContentOrderMatch = keyTokens.length === contentTokens.length &&
      keyTokens.every((t, i) => t === contentTokens[i]);
   if (!keyContentOrderMatch) {
      console.log(`❌ Key name token order does not match content: ${key}`);
      console.log(`   Key tokens: \$${keyTokens.join(",\$")}`);
      console.log(`   Content tokens: \$${contentTokens.join(",\$")}`);
      tokenError = true;
   }
}

const expectedArgCounts = {};
Object.keys(sourceTranslations).forEach((key) => {
   const tokens = extractTokens(sourceTranslations[key]);
   expectedArgCounts[key] = tokens.length === 0 ? 0 : Math.max(...tokens);
});

let argMismatch = false;
const usedKeys = new Set();

sourceFilePaths.forEach((filePath, fileIndex) => {
   const content = sourceFileContents[fileIndex];
   const lineStarts = getLineStarts(content);

   // Match L.KeyName where key names can contain $ (e.g., L.After$1AD)
   const lRefRe = /L\.([\w$]+)/g;
   for (const match of content.matchAll(lRefRe)) {
      usedKeys.add(match[1]);
   }

   const re = /\$t\(/g;
   let match;
   while ((match = re.exec(content)) !== null) {
      const args = parseCallArgs(content, match.index + 3);
      if (args.length === 0) continue;
      const keyResult = args[0].match(/^L\.([\w$]+)$/);
      if (!keyResult) continue;
      const key = keyResult[1];
      const expected = expectedArgCounts[key];
      if (expected === undefined) continue;
      const actual = args.length - 1;
      if (actual !== expected) {
         const lineNum = getLineNumber(lineStarts, match.index);
         console.log(`❌ ${filePath}:${lineNum}`);
         console.log(`   Key: L.${key}`);
         console.log(`   Value: "${sourceTranslations[key]}"`);
         console.log(`   Expected: ${expected} arg(s), Got: ${actual} arg(s)`);
         const line = getLineText(content, lineStarts, lineNum).trim();
         console.log(`   Call: ${line}`);
         argMismatch = true;
      }
   }
});

console.log("🟡 Remove Unused English Translation");
let translations = { ...sourceTranslations };

for (const key of Object.keys(translations)) {
   if (!key.startsWith("$") && !usedKeys.has(key)) {
      console.log(`Translation not used: ${key}`);
      delete translations[key];
   }
}

if (process.argv.includes("--sort")) {
   translations = Object.fromEntries(
      Object.entries(translations).sort(([a], [b]) => a.localeCompare(b))
   );
}

writeFileSync(EN_FILE_PATH, `export const EN = ${JSON.stringify(translations)};`);

console.log("🟡 Adjust Other Translation Based On English");

function getAllFiles(dir) {
   const files = [];
   const stack = [dir];

   while (stack.length > 0) {
      const currentDir = stack.pop();
      const paths = readdirSync(currentDir, { withFileTypes: true });
      for (const dirent of paths) {
         const res = resolve(currentDir, dirent.name);
         if (dirent.isDirectory()) {
            stack.push(res);
         } else {
            files.push(res);
         }
      }
   }

   return files;
}

const reset = process.argv.includes("--reset");

readdirSync(LANG_PATH).forEach((fileName) => {
   if (!fileName.endsWith(".ts") || fileName.startsWith("en.ts")) {
      return;
   }
   const variableName = fileName.replace(".ts", "").replace("-", "_").toUpperCase();
   const filePath = `${LANG_PATH}/${fileName}`;
   const fileContent = readFileSync(filePath, { encoding: "utf8" })
      .replace(`export const ${variableName} =`, "")
      .replace("};", "}");
   // biome-ignore lint/security/noGlobalEval: <explanation>
   const language = eval(`(${fileContent})`);
   const langResult = {};
   const untranslated = {};
   for (const k of Object.keys(translations)) {
      if (k.startsWith("$")) {
         langResult[k] = language[k];
         continue;
      }
      if (reset) {
         langResult[k] = translations[k];
         continue;
      }
      if (language[k]) {
         langResult[k] = language[k];
         continue;
      }
      untranslated[k] = translations[k];
   }
   Object.assign(langResult, untranslated);
   writeFileSync(filePath, `export const ${variableName} = ${JSON.stringify(langResult)};`);
});

console.log("🟡 Format Translation Files");

execSync(`biome format --write ${LANG_PATH}/`, {
   encoding: "utf8",
});

console.log("🟢 Translation has successfully updated");

if (argMismatch || tokenError) {
   process.exit(1);
}

function parseCallArgs(content, start) {
   const args = [];
   let current = "";
   let depth = 0;
   let inSingle = false;
   let inDouble = false;
   let inTemplate = false;
   let escape = false;
   let templateExprDepth = 0;

   for (let i = start; i < content.length; i++) {
      const ch = content[i];
      if (escape) {
         current += ch;
         escape = false;
         continue;
      }

      if (ch === "\\") {
         current += ch;
         escape = true;
         continue;
      }

      if (inTemplate) {
         if (ch === "`" && templateExprDepth === 0) {
            inTemplate = false;
         } else if (ch === "$" && content[i + 1] === "{") {
            templateExprDepth++;
            current += ch;
            current += "{";
            i++;
            continue;
         } else if (ch === "}" && templateExprDepth > 0) {
            templateExprDepth--;
         }
         current += ch;
         continue;
      }

      if (ch === "'" && !inDouble) {
         inSingle = !inSingle;
         current += ch;
      } else if (ch === '"' && !inSingle) {
         inDouble = !inDouble;
         current += ch;
      } else if (ch === "`" && !inSingle && !inDouble) {
         inTemplate = true;
         current += ch;
      } else if (!inSingle && !inDouble) {
         if (ch === "(") {
            depth++;
            current += ch;
         } else if (ch === ")") {
            if (depth === 0) {
               if (current.trim()) args.push(current.trim());
               break;
            }
            depth--;
            current += ch;
         } else if (ch === "," && depth === 0) {
            args.push(current.trim());
            current = "";
         } else {
            current += ch;
         }
      } else {
         current += ch;
      }
   }
   return args;
}

function getLineStarts(content) {
   const starts = [0];
   for (let i = 0; i < content.length; i++) {
      if (content[i] === "\n") {
         starts.push(i + 1);
      }
   }
   return starts;
}

function getLineNumber(lineStarts, charIndex) {
   let low = 0;
   let high = lineStarts.length - 1;
   let result = 0;

   while (low <= high) {
      const mid = (low + high) >> 1;
      if (lineStarts[mid] <= charIndex) {
         result = mid;
         low = mid + 1;
      } else {
         high = mid - 1;
      }
   }

   return result + 1;
}

function getLineText(content, lineStarts, lineNum) {
   const index = lineNum - 1;
   const start = lineStarts[index];
   const nextStart = lineStarts[index + 1];
   const end = nextStart === undefined ? content.length : nextStart - 1;
   return content.slice(start, end);
}

function extractTokens(str) {
   const tokens = [];
   const re = /\$(\d+)/g;
   let match;
   while ((match = re.exec(str)) !== null) {
      tokens.push(parseInt(match[1], 10));
   }
   return tokens;
}
