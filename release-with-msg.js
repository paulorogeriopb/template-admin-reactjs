import { execSync } from "child_process";

const releaseArg = process.argv[2] || "";

// Pega a última mensagem do commit (título + corpo)
const rawMessage = execSync("git log -1 --pretty=%B", {
  encoding: "utf-8",
}).trim();

// Remove emojis e tipos de commit
// Ex.: "✨ feat(teste): descrição real" => "descrição real"
const cleanMessage =
  rawMessage.replace(/^[^:]*:\s*/, "").trim() || "Nova versão";

// Pega a versão atual
const packageJson = JSON.parse(
  execSync("cat package.json", { encoding: "utf-8" })
);
const currentVersion = packageJson.version;

// Mensagem final
const releaseMsg = `chore(release): ${currentVersion} - ${cleanMessage}`;

console.log("Mensagem do release:", releaseMsg);

// Executa standard-version com a mensagem customizada
let cmd = `npx standard-version --releaseCommitMessageFormat "${releaseMsg}"`;

if (releaseArg) {
  cmd += ` --release-as ${releaseArg}`;
}

execSync(cmd, { stdio: "inherit" });
console.log("Release criado com sucesso!");
