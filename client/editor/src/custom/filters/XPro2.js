import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [255, 255, 0, 0.07];
const SATURATION_CONST = 0.2;
const CONTRAST_CONST = 0.15;

function XPro2(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
    BaseAdjustments.contrast(CONTRAST_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
XPro2.filterName = 'XPro2';

export default XPro2;
