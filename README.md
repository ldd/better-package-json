# better-package-json

Tool for managing project dependencies.
Inspired by [npm-gui](https://www.npmjs.com/package/npm-gui).

![analyze packages preview](./images/command-analyze-packages.png)

## Features

- annotate `package.json` files
- update all dependencies found in `package.json`, or just those patched with updates

## Configuration

This extension can be configured in User Settings or Workspace settings.

`"better-packages.safeMode": true`  
 This setting will control whether `#` is preprended to commands. This turns them into comments that you can modify at your leisure.

> e.g: `#yard add react@16.0.0`

`"better-packages.semVerRange": original || exact || tilde || caret`  
Specifies what semantic version range to use when updating packages.

Given these dependencies on `package.json` :

```
dependencies: {
  "A": "^1.0.0", // latest is 1.0.3
  "B": "~1.0.0" // latest is 1.0.4
}
```

`original`: Adapts to the range originally used in `package.json`.

> `yarn add A@^1.0.3 B@~1.0.4`

`exact`: Uses an exact version.

> `yarn add A@1.0.3 B@1.0.4`

`tilde`: Always uses `~`.

> `yarn add A@~1.0.3 B@~1.0.4`

`caret`: Always uses `^`.

> `yarn add A@^1.0.3 B@^1.0.4`

## Release Notes

#### 0.2.1

- fix some security issues

#### 0.2.0

- use `package-lock.json` instead of `npm-package-lock.json`

#### 0.1.0

add `safeMode` and `semVerRange` configuration options

#### 0.0.1

Initial public release
