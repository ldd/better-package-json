import { window, workspace } from "vscode";

export async function hasFile(filename: string): Promise<boolean> {
  if (workspace.rootPath) {
    const files = await workspace.findFiles(filename);
    return files && files.length > 0;
  }
  return false;
}
