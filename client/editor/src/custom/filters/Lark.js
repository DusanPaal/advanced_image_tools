import { BaseAdjustments } from '../adjustments';

const BRIGHTNESS_CONST = 0.08;
const ADJUST_RGB_CONST = [1, 1.03, 1.05];
const SATURATION_CONST = 0.12;

function Lark(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
    BaseAdjustments.adjustRGB(ADJUST_RGB_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Lark.filterName = 'Lark';

export default Lark;
