import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [255, 225, 0, 0.05];
const BRIGHTNESS_CONST = 0.06;
const CONTRAST_CONST = 0.06;

function Vesper(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
    BaseAdjustments.contrast(CONTRAST_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Vesper.filterName = 'Vesper';

export default Vesper;
