import { BaseAdjustments } from '../adjustments';

const SEPIA_CONST = 0.04;
const CONTRAST_CONST = -0.15;

function Gingham(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.sepia(SEPIA_CONST),
    BaseAdjustments.contrast(CONTRAST_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Gingham.filterName = 'Gingham';

export default Gingham;
