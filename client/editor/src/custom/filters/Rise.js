import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [255, 170, 0, 0.1];
const BRIGHTNESS_CONST = 0.09;
const SATURATION_CONST = 0.1;

function Rise(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Rise.filterName = 'Rise';

export default Rise;
