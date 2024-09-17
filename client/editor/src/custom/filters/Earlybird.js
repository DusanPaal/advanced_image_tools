import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [255, 165, 40, 0.2];

function Earlybird(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Earlybird.filterName = 'Earlybird';

export default Earlybird;
