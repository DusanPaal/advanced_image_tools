import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [255, 140, 0, 0.1];
const ADJUST_RGB_CONST = [1.15, 1.05, 1];
const SATURATION_CONST = 0.35;

function Kelvin(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.adjustRGB(ADJUST_RGB_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Kelvin.filterName = 'Kelvin';

export default Kelvin;
