import { execSync } from "child_process";

// Pega argumento de versão (minor, major, patch)
const releaseArg = process.argv[2] || "";

// Pega a última versão do package.json
const packageJson = JSON.parse(
  execSync("cat package.json", { encoding: "utf-8" })
);
const currentVersion = packageJson.version;

// Função para extrair a mensagem limpa do último commit
function getLastCommitMessage() {
  const rawMessage = execSync("git log -1 --pretty=%s", {
    encoding: "utf-8",
  }).trim();

  // Remove emojis e prefixos do commit
  // Ex.: "✨ feat(teste): adicionar login" => "adicionar login"
  const cleanMessage = rawMessage.replace(
    /^[^:]*:\s*/, // remove tudo até ": "
    ""
  );

  return cleanMessage || "Nova versão";
}

const lastMessage = getLastCommitMessage();

// Monta a mensagem da release
const releaseMsg = `chore(release): ${currentVersion} - ${lastMessage}`;

console.log("Mensagem do release:", releaseMsg);

// Executa standard-version usando a mensagem customizada
let cmd = `npx standard-version --releaseCommitMessageFormat "${releaseMsg}"`;

if (releaseArg) {
  cmd += ` --release-as ${releaseArg}`;
}

execSync(cmd, { stdio: "inherit" });
