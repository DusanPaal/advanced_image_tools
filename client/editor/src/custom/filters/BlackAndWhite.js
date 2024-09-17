import { BaseAdjustments } from '../adjustments';

const THRESHOLD_CONST = 100;

function BlackAndWhite(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.threshold_grayscale(THRESHOLD_CONST)
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
BlackAndWhite.filterName = 'BlackAndWhite';

export default BlackAndWhite;
