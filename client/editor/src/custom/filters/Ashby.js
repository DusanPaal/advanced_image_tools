import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [255, 160, 25, 0.1];
const BRIGHTNESS_CONST = 0.1;

function Ashby(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Ashby.filterName = 'Ashby';

export default Ashby;
