import { BaseAdjustments } from '../adjustments';

const CONTRAST_CONST = 0.1;
const SATURATION_CONST = 0.15;

function Hefe(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.contrast(CONTRAST_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Hefe.filterName = 'Hefe';

export default Hefe;
