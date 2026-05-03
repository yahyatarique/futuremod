import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { registry } from "./registry.js";
import { generateLlmsFullTxt, generateLlmsTxt } from "./llms.js";

const dir = dirname(fileURLToPath(import.meta.url));

writeFileSync(join(dir, "registry.json"), JSON.stringify(registry, null, 2));
writeFileSync(join(dir, "llms.txt"), generateLlmsTxt());
writeFileSync(join(dir, "llms-full.txt"), generateLlmsFullTxt());
