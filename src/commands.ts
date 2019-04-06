import { commands, ExtensionContext, window } from "vscode";
import { updateActiveEditor } from "./editor";
import { updatePackages } from "./helpers/updatePackages";

function analyzePackages() {
  for (const editor of window.visibleTextEditors) {
    updateActiveEditor(editor);
  }
}
async function updatePatchedPackages() {
  await updatePackages("minor");
}
async function updateAllPackages() {
  await updatePackages();
}

export function registerCommands(context: ExtensionContext) {
  const commandBuilderList = [
    { name: "analyzePackages", commandBuilder: analyzePackages },
    { name: "updatePatchedPackages", commandBuilder: updatePatchedPackages },
    { name: "updateAllPackages", commandBuilder: updateAllPackages }
  ];
  commandBuilderList.forEach(({ name, commandBuilder }) => {
    const customCommand = commands.registerCommand(`extension.${name}`, commandBuilder);
    context.subscriptions.push(customCommand);
  });
}
