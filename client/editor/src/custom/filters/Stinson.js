import { BaseAdjustments } from '../adjustments';

const BRIGHTNESS_CONST = 0.1;
const SEPIA_CONST = 0.3;

function Stinson(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
    BaseAdjustments.sepia(SEPIA_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Stinson.filterName = 'Stinson';

export default Stinson;
