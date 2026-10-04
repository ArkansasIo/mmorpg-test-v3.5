export type SoundName = string;

/** Lightweight sound facade used by UI components. Audio can be wired in later without changing callers. */
export const sound = {
  _enabled: true,
  isEnabled(): boolean {
    return this._enabled;
  },
  play(_name?: any, ..._args: any[]): void {
    // Intentionally silent until packaged audio assets are available.
  },
  setEnabled(_enabled?: any, ..._args: any[]): void {
    this._enabled = Boolean(_enabled);
  },
  toggle(..._args: any[]): boolean {
    this._enabled = !this._enabled;
    return this._enabled;
  },
};
