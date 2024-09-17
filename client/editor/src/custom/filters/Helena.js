import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [208, 208, 86, 0.2];
const CONTRAST_CONST = 0.15;

function Helena(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.contrast(CONTRAST_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Helena.filterName = 'Helena';

export default Helena;
