import { BaseAdjustments } from '../adjustments';

const BRIGHTNESS_CONST = 0.1;

function Moon(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.grayscale(),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
  );

  const pixels = imageData.data; //  [0, 1, 2, 3,...] => [r, g, b, a, ...]
  const len = pixels.length;
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Moon.filterName = 'Moon';

export default Moon;
