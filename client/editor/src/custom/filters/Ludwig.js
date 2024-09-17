import { BaseAdjustments } from '../adjustments';

const BRIGHTNESS_CONST = 0.05;
const SATURATION_CONST = -0.03;

function Ludwig(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Ludwig.filterName = 'Ludwig';

export default Ludwig;
