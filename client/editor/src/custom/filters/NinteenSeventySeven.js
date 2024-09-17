import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [255, 25, 0, 0.15];
const BRIGHTNESS_CONST = 0.1;

function NinteenSeventySeven(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
NinteenSeventySeven.filterName = 'NinteenSeventySeven';

export default NinteenSeventySeven;
