/********
 *
 * from parsePackages
 *
 ********/

type DependencyType = "development" | "default";

//  fortunately, since TS 2.9 you can use the import() syntax:
// https://stackoverflow.com/a/51114250
interface IFetchingDependency {
  fetchedData: Promise<import("node-fetch").Response>;
  dependencyName: string;
  dependencyType: DependencyType;
  semanticVersionRange: string;
  range: import("vscode").Range;
}
/********
 *
 * from cache
 *
 ********/
type PermissiveReleaseType = import("semver").ReleaseType | null;

interface IPackage {
  name: string;
  type: DependencyType;
  semanticVersionRange: string;
  latest: string;
  current: string;
  range?: string;
  releaseType: PermissiveReleaseType;
}

interface IReleaseMap {
  patch: IPackage[];
  minor: IPackage[];
  major: IPackage[];
  other: IPackage[];
  [key: string]: IPackage[];
}

/********
 *
 * from files
 *
 ********/
interface IJSONFileContents {
  editor?: import("vscode").TextEditor;
  rawText: string;
  dependencies: ReadonlyArray<object>;
  devDependencies: ReadonlyArray<object>;
}
