import { execSync } from "child_process";

// Pega a última mensagem do commit
let lastCommitMessage = execSync("git log -1 --pretty=%B", {
  encoding: "utf-8",
}).trim();

// Remove emojis e prefixos como "🔧 chore(teste): "
lastCommitMessage = lastCommitMessage.replace(/^.*?\(\s*.*?\):\s*/, "").trim();

// Atualiza versão com standard-version, mas sem commit/tag automáticos
execSync("npx standard-version --skip.commit --skip.tag", { stdio: "inherit" });

// Pega a nova versão
const packageJson = JSON.parse(
  execSync("cat package.json", { encoding: "utf-8" })
);
const newVersion = packageJson.version;

// Commit manual da release (opcional, pode usar a própria mensagem do último commit)
execSync("git add package.json package-lock.json CHANGELOG.md", {
  stdio: "inherit",
});
execSync(`git commit -m "${lastCommitMessage}"`, { stdio: "inherit" });

// Cria tag usando apenas a mensagem limpa
execSync(`git tag -a "v${newVersion}" -m "${lastCommitMessage}"`, {
  stdio: "inherit",
});

console.log(
  `Release v${newVersion} criada com mensagem: "${lastCommitMessage}"`
);
