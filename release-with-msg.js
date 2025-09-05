const { execSync } = require("child_process");

// Pega o argumento da versão (minor, major, patch)
const releaseArg = process.argv[2] || "";

// Comando base para standard-version
let cmd = "npx standard-version";

// Adiciona --release-as se passado (minor, major, patch)
if (releaseArg) {
  cmd += ` --release-as ${releaseArg}`;
}

// Define o formato do commit de release para pegar o último commit
cmd += ` --releaseCommitMessageFormat "chore(release): {{currentTag}} - {{latestCommitMessage}}"`;

// Executa o standard-version de verdade
execSync(cmd, { stdio: "inherit" });

console.log("Release criada com sucesso!");
