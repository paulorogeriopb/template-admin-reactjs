import { execSync } from "child_process";

// Argumento de versão opcional (minor, major, patch)
const releaseArg = process.argv[2] || "";

// Pega a mensagem completa do último commit
const rawMessage = execSync("git log -1 --pretty=%B", {
  encoding: "utf-8",
}).trim();

// Separa título e corpo
const lines = rawMessage
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line !== "");

// A descrição longa é tudo que vem **depois da primeira linha**
const longDescription = lines.slice(1).join(" ") || "Nova versão";

// Pega a versão atual do package.json
const packageJson = JSON.parse(
  execSync("cat package.json", { encoding: "utf-8" })
);
const currentVersion = packageJson.version;

// Monta a mensagem final do release
const releaseMsg = `chore(release): ${currentVersion} - ${longDescription}`;

console.log("Mensagem do release:", releaseMsg);

// Executa o standard-version com a mensagem customizada
let cmd = `npx standard-version --releaseCommitMessageFormat "${releaseMsg}"`;

if (releaseArg) {
  cmd += ` --release-as ${releaseArg}`;
}

execSync(cmd, { stdio: "inherit" });

console.log("Release criada com sucesso!");
