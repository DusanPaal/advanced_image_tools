import { BaseAdjustments } from '../adjustments';

const CONTRAST_CONST = 0.15;
const BRIGHTNESS_CONST = 0.1;

function Dogpatch(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.contrast(CONTRAST_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Dogpatch.filterName = 'Dogpatch';

export default Dogpatch;
