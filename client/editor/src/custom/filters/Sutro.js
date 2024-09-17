import { BaseAdjustments } from '../adjustments';

const BRIGHTNESS_CONST = -0.1;
const SATURATION_CONST = -0.1;

function Sutro(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Sutro.filterName = 'Sutro';

export default Sutro;
