import { BaseAdjustments } from '../adjustments';

const BRIGHTNESS_CONST = 0.1;
const COLOR_FILTER_CONST = [255, 255, 0, 0.2];

function Walden(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Walden.filterName = 'Walden';

export default Walden;
