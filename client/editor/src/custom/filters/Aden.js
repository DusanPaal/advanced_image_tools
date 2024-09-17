import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [228, 130, 225, 0.13];
const SATURATION_CONST = -0.2;

function Aden(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Aden.filterName = 'Aden';

export default Aden;
