import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [100, 28, 210, 0.03];
const BRIGHTNESS_CONST = 0.1;

function Willow(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.grayscale(),
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Willow.filterName = 'Willow';

export default Willow;
