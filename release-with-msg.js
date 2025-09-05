import { execSync } from "child_process";

// Pega argumento da versão (patch, minor, major)
const releaseArg = process.argv[2] || "";

// Pega a mensagem do último commit
const lastCommitMessage = execSync("git log -1 --pretty=%B", {
  encoding: "utf-8",
}).trim();

// Atualiza versão com standard-version, mas sem commit/tag automáticos
let cmd = "npx standard-version --skip.commit --skip.tag";
if (releaseArg) cmd += ` --release-as ${releaseArg}`;
execSync(cmd, { stdio: "inherit" });

// Pega a nova versão
const packageJson = JSON.parse(
  execSync("cat package.json", { encoding: "utf-8" })
);
const newVersion = packageJson.version;

// Commita manualmente com a mensagem do último commit
execSync(`git add package.json package-lock.json CHANGELOG.md`, {
  stdio: "inherit",
});
execSync(`git commit -m "${lastCommitMessage}"`, { stdio: "inherit" });

// Cria tag usando apenas a mensagem do commit
execSync(`git tag -a "v${newVersion}" -m "${lastCommitMessage}"`, {
  stdio: "inherit",
});

console.log(
  `Release v${newVersion} criada com mensagem: "${lastCommitMessage}"`
);
