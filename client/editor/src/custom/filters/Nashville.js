import { BaseAdjustments } from '../adjustments';

const COLOR_FILTER_CONST = [220, 115, 188, 0.12];
const CONTRAST_CONST = -0.05;

function Nashville(imageData) {
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.colorFilter(COLOR_FILTER_CONST),
    BaseAdjustments.contrast(CONTRAST_CONST),
  );
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Nashville.filterName = 'Nashville';

export default Nashville;
