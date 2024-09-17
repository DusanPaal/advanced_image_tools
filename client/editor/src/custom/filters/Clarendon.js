import { BaseAdjustments } from '../adjustments';

const BRIGHTNESS_CONST = 0.1;
const CONTRAST_CONST = 0.1;
const SATURATION_CONST = 0.15;

function Clarendon(imageData) {
  console.info("Applying Clarendon filter...")
  BaseAdjustments.apply(
    imageData,
    BaseAdjustments.brightness(BRIGHTNESS_CONST),
    BaseAdjustments.contrast(CONTRAST_CONST),
    BaseAdjustments.saturation(SATURATION_CONST),
  );
  console.info("The Clarendon filter applied.")
}

// We assign the filter name here instead of using
// the fn.name as on prod.code the fn.name is optimized
// that might cause bug in that case.
Clarendon.filterName = 'Clarendon';

export default Clarendon;
