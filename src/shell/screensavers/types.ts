export interface ScreensaverRenderer {
  name: string;
  init(ctx: CanvasRenderingContext2D, width: number, height: number): void;
  render(time: number): void;
  destroy(): void;
}
