import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [230, 115, 108, 0.05];
const SATURATION_CONST = 0.15;

function Mayfair(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Mayfair.filterName = 'Mayfair';

export default Mayfair;
