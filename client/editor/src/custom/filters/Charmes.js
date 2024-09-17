import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [255, 50, 80, 0.12];
const CONTRAST_CONST = 0.05;

function Charmes(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.contrast(CONTRAST_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Charmes.filterName = 'Charmes';

export default Charmes;
