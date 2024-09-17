/** External Dependencies */
import Konva from 'konva';
import { Factory as KonvaFactory } from 'konva/lib/Factory';
import { getNumberValidator as konvaGetNumberValidator } from 'konva/lib/Validators';

function Warmth(imageData) {

  let warmthValue = this.warmth();
  const pixels = imageData.data; //  [0, 1, 2, 3,...] => [r, g, b, a, ...]
  const len = pixels.length;

  // clamp the warmth value to range 0-20 (including)
  warmthValue = Math.min(Math.max(warmthValue, 0), 20);

  for (let i = 0; i < len; i += 4) {
    pixels[i] += warmthValue; // red
    pixels[i + 2] -= warmthValue; // blue
  }
}

Warmth.finetuneName = 'Warmth'; // We assign the finetune name here instead of using the fn. name as on prod. code the fn. name is optimized that might cause bug in that case.

export default Warmth;

/**
 * adds warmth parameter (0 - 200), 0 means no value... 200 max value.
 */
KonvaFactory.addGetterSetter(
  Konva.Image,
  'warmth',
  0,
  konvaGetNumberValidator(),
  KonvaFactory.afterSetFilter,
);