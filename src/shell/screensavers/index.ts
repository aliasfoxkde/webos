import type { ScreensaverRenderer } from './types';
import type { ScreensaverType } from '@/stores/screensaver-store';

import { createBubblesRenderer } from './bubbles';
import { createStarsRenderer } from './stars';
import { createMatrixRenderer } from './matrix';
import { createParticlesRenderer } from './particles';
import { createWavesRenderer } from './waves';
import { createFireworksRenderer } from './fireworks';
import { createNeuralRenderer } from './neural';

const factories: Record<ScreensaverType, () => ScreensaverRenderer> = {
  bubbles: createBubblesRenderer,
  stars: createStarsRenderer,
  matrix: createMatrixRenderer,
  particles: createParticlesRenderer,
  waves: createWavesRenderer,
  fireworks: createFireworksRenderer,
  neural: createNeuralRenderer,
};

export function createScreensaver(type: ScreensaverType): ScreensaverRenderer {
  return factories[type]();
}

export { type ScreensaverRenderer } from './types';
