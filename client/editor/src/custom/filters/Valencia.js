import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [255, 225, 80, 0.08];
const SATURATION_CONST = 0.1;
const CONTRAST_CONST = 0.05;

function Valencia(imageData) {
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
Valencia.filterName = 'Valencia';

export default Valencia;
