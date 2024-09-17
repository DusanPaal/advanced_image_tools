import { BaseAdjustments } from '../adjustments';

const SEPIA_CONST = 0.06;
const BRIGHTNESS_CONST = 0.1;

function Ginza(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.sepia(SEPIA_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Ginza.filterName = 'Ginza';

export default Ginza;
