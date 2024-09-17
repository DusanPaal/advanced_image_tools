import { BaseAdjustments } from '../adjustments';

const CONTRAST_CONST = 0.2;
const COLOR_FILTER_CONST = [140, 10, 185, 0.1];

function Brannan(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.contrast(CONTRAST_CONST),
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Brannan.filterName = 'Brannan';

export default Brannan;
