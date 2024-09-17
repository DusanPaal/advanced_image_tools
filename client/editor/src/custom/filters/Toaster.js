import { BaseAdjustments } from '../adjustments';

const SEPIA_CONST = 0.1;
const COLOR_FILTER_CONST = [255, 145, 0, 0.2];

function Toaster(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.sepia(SEPIA_CONST),
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Toaster.filterName = 'Toaster';

export default Toaster;
