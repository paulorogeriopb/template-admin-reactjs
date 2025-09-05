import { execSync } from "child_process";

// Pega a última mensagem do commit
let lastCommitMessage = execSync("git log -1 --pretty=%B", {
  encoding: "utf-8",
}).trim();

// Remove emojis e prefixos como "🔧 chore(teste): "
lastCommitMessage = lastCommitMessage.replace(/^.*?\(\s*.*?\):\s*/, "").trim();

// Se estiver vazia, coloca uma mensagem padrão
if (!lastCommitMessage) {
  lastCommitMessage = "Nova versão";
}

// Atualiza versão com standard-version sem commit/tag automáticos
execSync("npx standard-version --skip.commit --skip.tag", { stdio: "inherit" });

// Pega a nova versão do package.json
const packageJson = JSON.parse(
  execSync("cat package.json", { encoding: "utf-8" })
);
const newVersion = packageJson.version;

// Adiciona arquivos ao commit
execSync("git add package.json package-lock.json CHANGELOG.md", {
  stdio: "inherit",
});

// Cria commit da release usando a mensagem limpa
execSync(`git commit -m "${lastCommitMessage}"`, { stdio: "inherit" });

// Cria tag usando apenas a mensagem limpa
execSync(`git tag -a "v${newVersion}" -m "${lastCommitMessage}"`, {
  stdio: "inherit",
});

console.log(
  `Release v${newVersion} criada com mensagem: "${lastCommitMessage}"`
);
