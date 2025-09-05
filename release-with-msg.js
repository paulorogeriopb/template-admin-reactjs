import { execSync } from "child_process";

// Pega o argumento da versão (minor, major, patch)
const releaseArg = process.argv[2] || "";

// Pega a mensagem do último commit
const lastCommit = execSync("git log -1 --pretty=%B", {
  encoding: "utf-8",
}).trim();

// Monta o comando do standard-version
let cmd = "npx standard-version";
if (releaseArg) {
  cmd += ` --release-as ${releaseArg}`;
}

// Usa a mensagem do último commit no commit de release
cmd += ` --releaseCommitMessageFormat "chore(release): {{currentTag}} - ${lastCommit}"`;

// Executa o comando
execSync(cmd, { stdio: "inherit" });

console.log("Release criada com sucesso!");
