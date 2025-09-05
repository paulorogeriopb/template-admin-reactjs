import { execSync } from "child_process";

// Pega o argumento da versão (minor, major, patch)
const releaseArg = process.argv[2] || "";

// Pega a mensagem do último commit
const lastCommit = execSync("git log -1 --pretty=%B", {
  encoding: "utf-8",
}).trim();

// Incrementa a versão com standard-version sem criar commit automático
let cmd = "npx standard-version --skip.commit --skip.tag";
if (releaseArg) {
  cmd += ` --release-as ${releaseArg}`;
}
execSync(cmd, { stdio: "inherit" });

// Pega a versão que acabou de ser atualizada
const pkg = JSON.parse(execSync("cat package.json", { encoding: "utf-8" }));
const version = pkg.version;

// Cria commit de release e tag manualmente, usando apenas a mensagem do último commit
execSync(`git add package.json package-lock.json CHANGELOG.md`, {
  stdio: "inherit",
});
execSync(`git commit -m "${lastCommit}"`, { stdio: "inherit" });
execSync(`git tag -a "v${version}" -m "${lastCommit}"`, { stdio: "inherit" });

console.log(`Release v${version} criada com mensagem: "${lastCommit}"`);
