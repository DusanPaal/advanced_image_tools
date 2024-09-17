import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [225, 240, 0, 0.1];
const SATURATION_CONST = 0.25;
const CONTRAST_CONST = 0.05;

function Maven(imageData) {
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
Maven.filterName = 'Maven';

export default Maven;
