const { execSync } = require("child_process");

// Pega o argumento da versão (minor, major, patch)
const releaseArg = process.argv[2] || "";

// Gera o release sem commit/push automático
let cmd = "npx standard-version --dry-run";

if (releaseArg) {
  cmd += ` --release-as ${releaseArg}`;
}

// Executa o standard-version em dry-run e captura a saída
const output = execSync(cmd, { encoding: "utf-8" });

// Extrai a linha do commit de release
const match = output.match(/chore\(release\): .+/);
const releaseMsg = match ? match[0] : `chore(release): new version`;

console.log("Mensagem do release:", releaseMsg);

// Cria o release de verdade com a mensagem capturada
execSync(
  `npx standard-version --message "${releaseMsg}" ${
    releaseArg ? "--release-as " + releaseArg : ""
  }`,
  { stdio: "inherit" }
);
