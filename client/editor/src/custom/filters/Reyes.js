import { BaseAdjustments } from '../adjustments';

const SEPIA_CONST = 0.4;
const BRIGHTNESS_CONST = 0.13;
const CONTRAST_CONST = -0.05;

function Reyes(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.sepia(SEPIA_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
    BaseAdjustments.contrast(CONTRAST_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Reyes.filterName = 'Reyes';

export default Reyes;
