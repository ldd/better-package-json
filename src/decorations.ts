import { OverviewRulerLane, ThemableDecorationRenderOptions, window } from "vscode";

export function decorateUpdatedPackage({
  overviewRulerColor = "red",
  light,
  dark,
  contentText
}: {
  overviewRulerColor: string;
  light: ThemableDecorationRenderOptions;
  dark: ThemableDecorationRenderOptions;
  contentText: string;
}) {
  return window.createTextEditorDecorationType({
    isWholeLine: true,
    overviewRulerLane: OverviewRulerLane.Right,
    after: {
      margin: "2em",
      contentText
    },
    overviewRulerColor,
    light,
    dark
  });
}

// colors heavily inspired by
// https://github.com/jest-community/vscode-jest/blob/master/src/decorations.ts

export function decorateMajorUpdatedPackage(current: string, latest: string) {
  return decorateUpdatedPackage({
    overviewRulerColor: "red",
    light: { after: { color: "#FF564B" } },
    dark: { after: { color: "#AD322D" } },
    contentText: `installed: ${current}\t\t latest: ${latest}`
  });
}

export function decorateMinorUpdatedPackage(current: string, latest: string) {
  return decorateUpdatedPackage({
    overviewRulerColor: "yellow",
    light: { after: { color: "#FED37F" } },
    dark: { after: { color: "#FED37F" } },
    contentText: `installed: ${current}\t\t latest: ${latest}`
  });
}

export function decoratePatchUpdatedPackage(current: string, latest: string) {
  return decorateUpdatedPackage({
    overviewRulerColor: "green",
    light: { after: { color: "#3BB26B" } },
    dark: { after: { color: "#2F8F51" } },
    contentText: `installed: ${current}\t\t latest: ${latest}`
  });
}

export function decorateNonUpdatedPackage(current: string) {
  return decorateUpdatedPackage({
    overviewRulerColor: "darkgray",
    light: { color: "lightgray", after: { color: "lightgray" } },
    dark: { color: "darkgray", after: { color: "darkgray" } },
    contentText: `installed version is latest (${current})`
  });
}

export function decorateNotFoundPackage(text: string = "Not Found") {
  return decorateUpdatedPackage({
    overviewRulerColor: "darkgray",
    light: { color: "lightgray", after: { color: "lightgray" } },
    dark: { color: "darkgray", after: { color: "darkgray" } },
    contentText: `[${text}]`
  });
}

export default {
  decorateMajorUpdatedPackage,
  decorateMinorUpdatedPackage,
  decorateNonUpdatedPackage,
  decorateNotFoundPackage,
  decoratePatchUpdatedPackage
};
