import { BaseAdjustments } from '../adjustments';

const ADJUST_RGB_CONST = [1.04, 1, 1.02];
const SATURATION_CONST = -0.05;

function Crema(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.adjustRGB(ADJUST_RGB_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Crema.filterName = 'Crema';

export default Crema;
