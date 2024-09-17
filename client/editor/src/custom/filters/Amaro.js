import { BaseAdjustments } from '../adjustments';

const SATURATION_CONST = 0.3;
const BRIGHTNESS_CONST = 0.15;

function Amaro(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.saturation(SATURATION_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Amaro.filterName = 'Amaro';

export default Amaro;
