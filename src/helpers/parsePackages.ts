import fetch, { Response } from "node-fetch";
import { dirname, join } from "path";
import { diff } from "semver";
import { DecorationOptions, Range, TextEditor, workspace } from "vscode";

// based on: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
class NotFoundError extends Error {
  public options: Range[] | DecorationOptions[];

  constructor(message: string, options: Range[] | DecorationOptions[]) {
    super(message); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.options = options;
  }
}

export function fetchDependencyData(
  editor: TextEditor,
  {
    dependencies,
    rawText,
    dependencyType
  }: { dependencies: object; rawText: string; dependencyType: DependencyType }
): IFetchingDependency[] {
  return Object.entries(dependencies).map(([dependencyName, dependencyRange]) => {
    const index = rawText.lastIndexOf(dependencyName);
    const range = new Range(
      editor.document.positionAt(index),
      editor.document.positionAt(index + dependencyName.length)
    );
    // we are deliberately not awaiting the results of the fetch here
    const fetchedData = fetch(`https://registry.npmjs.org/${dependencyName}`);
    return {
      fetchedData,
      dependencyName,
      dependencyType,
      semanticVersionRange: "" + dependencyRange,
      range
    };
  });
}

export async function parseDependencyData(
  editor: TextEditor,
  {
    fetchedData,
    dependencyName: name,
    dependencyType: type,
    semanticVersionRange,
    range
  }: IFetchingDependency
) {
  // the data fetched has the latest version of the package we want, and its repository url
  const rawData = await fetchedData;
  const data = await rawData.json();
  if (data.error) {
    throw new NotFoundError("Not Found on NPM", [range]);
  }
  const { "dist-tags": { latest } = { latest: "" }, repository: { url } = { url: "" } } = data;

  // from the file system we get the installed version of the package
  const folder = dirname(editor.document.uri.path);
  const fileName = join(folder, `node_modules/${name}/package.json`);
  try {
    const rawFileData = await workspace.openTextDocument(fileName);
    const rawText = await rawFileData.getText();
    const text = JSON.parse(rawText);
    const { version: current } = text;

    const releaseType = diff(current, latest);
    return { url, range, current, latest, type, releaseType, name, semanticVersionRange };
  } catch (error) {
    throw new NotFoundError("Not Found on Filesystem", [range]);
  }
}
