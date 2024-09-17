import { BaseAdjustments } from '../adjustments';

const SATURATION_CONST = 0.35;
const BRIGHTNESS_CONST = 0.1;

function Skyline(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.saturation(SATURATION_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Skyline.filterName = 'Skyline';

export default Skyline;
