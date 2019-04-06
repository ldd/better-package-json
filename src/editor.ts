import { ReleaseType } from "semver";
import { DecorationOptions, MarkdownString, Range, TextEditor } from "vscode";
import { cache } from "./cache";
import decorations from "./decorations";
import { fetchDependencyData, parseDependencyData } from "./helpers/parsePackages";

export function updateActiveEditor(editor: TextEditor) {
  if (!editor) {
    return;
  }
  if (!editor.document.fileName.endsWith("package.json")) {
    return;
  }
  const rawText = editor.document.getText();
  try {
    const { dependencies, devDependencies } = JSON.parse(rawText);

    const promisedVersionList = fetchDependencyData(editor, {
      dependencies,
      rawText,
      dependencyType: "default"
    })
      .concat(
        fetchDependencyData(editor, {
          dependencies: devDependencies,
          rawText,
          dependencyType: "development"
        })
      )
      .map(version => parseDependencyData(editor, version));

    promisedVersionList.map(async promisedVersion => {
      try {
        const { name, url, range, ...otherProps } = await promisedVersion;
        decorate(editor, {
          url,
          range,
          ...otherProps
        });
        cache.add({ name, ...otherProps });
      } catch (error) {
        if (error && error.options) {
          editor.setDecorations(decorations.decorateNotFoundPackage(error), error.options);
        }
      }
    });
  } catch (error) {
    console.error(error);
    console.info("Error parsing package.json. Is it a valid JSON file?");
  }
}

function decorate(
  editor: TextEditor,
  {
    url,
    range,
    current,
    latest,
    releaseType
  }: {
    url: string;
    range: Range;
    current: string;
    latest: string;
    releaseType: ReleaseType | null;
  }
) {
  // we pick a decorator based on the difference in versions (whether they are a minor change, mayor change, etc)
  const decorator = pickDecorator(releaseType);

  // we build the decorationOptions. Bonus information: the repository url on hover
  const hoverMessage = new MarkdownString(`[source code](${url})`);
  const options: DecorationOptions[] = [{ range, hoverMessage }];

  editor.setDecorations(decorator(current, latest), options);
}

function pickDecorator(difference: ReleaseType | null) {
  switch (difference) {
    case "major":
      return decorations.decorateMajorUpdatedPackage;
    case "minor":
      return decorations.decorateMinorUpdatedPackage;
    case "patch":
      return decorations.decoratePatchUpdatedPackage;
    default:
      return decorations.decorateNonUpdatedPackage;
  }
}
