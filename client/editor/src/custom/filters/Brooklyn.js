import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [25, 240, 252, 0.05];
const SEPIA_CONST = 0.3;

function Brooklyn(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.sepia(SEPIA_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Brooklyn.filterName = 'Brooklyn';

export default Brooklyn;
