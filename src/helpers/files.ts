import { TextEditor, window, workspace } from "vscode";

export async function hasFile(filename: string): Promise<boolean> {
  if (workspace.rootPath) {
    const files = await workspace.findFiles(filename);
    return files && files.length > 0;
  }
  return false;
}

export async function getPackageJSONFile(
  editor?: TextEditor
): Promise<{ editor?: TextEditor; rawText: string }> {
  // attempt to parse already opened file
  if (editor && editor.document && editor.document.fileName.endsWith("package.json")) {
    const rawText = editor.document.getText();
    return { editor, rawText };
  }

  // otherwise find the file in the workspace
  if (workspace.rootPath) {
    const files = await workspace.findFiles("package.json");
    if (files && files.length > 0) {
      const file = files[0];
      const document = await workspace.openTextDocument(file);
      const someEditor = await window.showTextDocument(document);
      const rawText = someEditor.document.getText();
      return { editor: someEditor, rawText };
    }
  }
  return { editor, rawText: "" };
}

export async function parsePackageJSONFile(defaultEditor?: TextEditor): Promise<IJSONFileContents> {
  const { editor, rawText } = await getPackageJSONFile(defaultEditor);
  const { dependencies = [], devDependencies = [] } = JSON.parse(rawText);
  return { editor, rawText, dependencies, devDependencies };
}
