import { BaseAdjustments } from '../adjustments';

const ADJUST_RGB_CONST = [1, 1, 1.25];
const CONTRAST_CONST = 0.1;
const BRIGHTNESS_CONST = 0.15;

function Hudson(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.adjustRGB(ADJUST_RGB_CONST),
    BaseAdjustments.contrast(CONTRAST_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Hudson.filterName = 'Hudson';

export default Hudson;
