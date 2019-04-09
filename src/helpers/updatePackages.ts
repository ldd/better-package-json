import { window, workspace } from "vscode";
import { cache } from "../cache";
import { hasFile } from "./files";

// make sure we have an up-to-date configuration for our extension
let config = workspace.getConfiguration("better-packages");
workspace.onDidChangeConfiguration(() => {
  config = workspace.getConfiguration("better-packages");
});

function buildDependencyString({ name, latest, semanticVersionRange }: IPackage): string {
  return `${name}@${getDependencyRange(semanticVersionRange)}${latest}`;
}

export async function updatePackages(releaseType?: PermissiveReleaseType) {
  const terminal = window.createTerminal();
  const allDependencies: IPackage[] = cache.get(releaseType);

  const dependencies: string[] = allDependencies
    .filter(({ type }) => type === "default")
    .map(buildDependencyString);
  const devDependencies: string[] = allDependencies
    .filter(({ type }) => type === "development")
    .map(buildDependencyString);

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
      commandList = commandList.concat(`yarn add ${dependencies.join(" ")}`);
    }
    if (devDependencies.length > 0) {
      commandList = commandList.concat(`yarn add ${devDependencies.join(" ")} --dev`);
    }
  }
  // attempt to find a npm lock file
  else {
    const npmLockFileExists = await hasFile("npm-package-lock.json");
    if (npmLockFileExists) {
      if (dependencies.length > 0) {
        commandList = commandList.concat(`npm install ${dependencies.join(" ")} --save`);
      }
      if (devDependencies.length > 0) {
        commandList = commandList.concat(`npm install ${devDependencies.join(" ")} --save-dev`);
      }
    }
  }
  // if safeMode is enabled, prepend a # to make commands comments and avoid executing them
  const safeMode: boolean | undefined = config.get("safeMode");
  if (safeMode) {
    commandList = commandList.map(command => `#${command}`);
  }

  return commandList;
}

// Some examples to understand this function:
// "caret": returns "^", will be used as "someName@^3.4.0"
// "tilde": returns "~", will be used as "someName@~3.4.0"
// "exact": returns "", will be used as "someName@3.4.0"
// "original": returns "^","~" or "", will be used as "someName@^3.4.0",etc (based on sem-ver range used in package.json)
function getDependencyRange(range?: string): string {
  const semVerRange: string = config.get("semVerRange") || "original";
  if (semVerRange === "caret") {
    return "^";
  } else if (semVerRange === "tilde") {
    return "~";
  } else if (semVerRange === "exact") {
    return "";
  }
  // handle original case
  // we peek at the start of semVerRange and use that as our range
  else if (semVerRange === "original") {
    if (range && range.length > 0) {
      if (range[0] === "^") {
        return "^";
      }
      if (range[0] === "~") {
        return "~";
      }
    }
  }
  return "";
}
