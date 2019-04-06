class Cache {
  private map: IReleaseMap = { patch: [], minor: [], major: [], other: [] };

  constructor() {
    this.map = { patch: [], minor: [], major: [], other: [] };
  }

  public add(dependency: IPackage): void {
    const { releaseType } = dependency;
    if (releaseType && this.map[releaseType]) {
      this.map[releaseType].push(dependency);
    } else {
      this.map.other.push(dependency);
    }
  }

  public get(wantedReleaseType?: PermissiveReleaseType): IPackage[] {
    if (wantedReleaseType && this.map[wantedReleaseType]) {
      return this.map[wantedReleaseType];
    }
    return [...this.map.major, ...this.map.minor, ...this.map.other];
  }
}

export const cache = new Cache();
