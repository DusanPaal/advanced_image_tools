import { BaseAdjustments } from '../adjustments';

const ADJUST_RGB_CONST = [1.05, 1.1, 1];

function Perpetua(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.adjustRGB(ADJUST_RGB_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Perpetua.filterName = 'Perpetua';

export default Perpetua;
