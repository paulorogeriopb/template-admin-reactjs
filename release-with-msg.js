import { execSync } from "child_process";

// Pega argumento de versão (minor, major, patch)
const releaseArg = process.argv[2] || "";

// Função para extrair a mensagem limpa do último commit
function getLastCommitMessage() {
  // Pega o último commit feito
  const rawMessage = execSync("git log -1 --pretty=%B", {
    encoding: "utf-8",
  }).trim();

  // Remove emoji e tipo de commit do Commitizen
  // Ex.: ✨ feat(teste): adicionar login  =>  adicionar login
  const cleanMessage = rawMessage.replace(
    /^[^\w]*(feat|fix|chore|docs|style|refactor|test|perf|ci|build)\([^\)]*\):\s*/,
    ""
  );

  return cleanMessage || "Nova versão";
}

const releaseMsg = getLastCommitMessage();

console.log("Mensagem do release:", releaseMsg);

// Cria a release de verdade com a mensagem limpa
let cmd = `npx standard-version --releaseCommitMessageFormat "chore(release): ${releaseMsg}"`;

if (releaseArg) {
  cmd += ` --release-as ${releaseArg}`;
}

execSync(cmd, { stdio: "inherit" });
