import { window } from "vscode";
import { cache } from "../cache";
import { hasFile } from "./files";

export async function updatePackages(releaseType?: PermissiveReleaseType) {
  const terminal = window.createTerminal();
  const allDependencies: IPackage[] = cache.get(releaseType);

  const dependencies: string[] = allDependencies
    .filter(({ type }) => type === "default")
    .map(({ name, latest }) => `${name}@${latest}`);
  const devDependencies: string[] = allDependencies
    .filter(({ type }) => type === "development")
    .map(({ name, latest }) => `${name}@${latest}`);

  // show terminal if we need to install dependencies
  if (dependencies.length > 0 || devDependencies.length > 0) {
    terminal.show();
  }
  const commandList = await getInstallTextList(dependencies, devDependencies);
  commandList.forEach(command => {
    terminal.sendText(command);
  });
}

export async function getInstallTextList(dependencies: string[], devDependencies: string[]) {
  let commandList: ReadonlyArray<string> = [];
  const yarnLockFileExists = await hasFile("yarn.lock");
  if (yarnLockFileExists) {
    if (dependencies.length > 0) {
      commandList = commandList.concat(`#yarn add ${dependencies.join(" ")}`);
    }
    if (devDependencies.length > 0) {
      commandList = commandList.concat(`#yarn add ${devDependencies.join(" ")} --dev`);
    }
  }
  // attempt to find a npm lock file
  else {
    const npmLockFileExists = await hasFile("npm-package-lock.json");
    if (npmLockFileExists) {
      if (dependencies.length > 0) {
        commandList = commandList.concat(`#npm install ${dependencies.join(" ")} --save`);
      }
      if (devDependencies.length > 0) {
        commandList = commandList.concat(`#npm install ${devDependencies.join(" ")} --save-dev`);
      }
    }
  }
  return commandList;
}
