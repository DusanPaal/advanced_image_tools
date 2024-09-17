/** External Dependencies */
import Konva from 'konva';
import { Factory as KonvaFactory } from 'konva/lib/Factory';
import { getNumberValidator as konvaGetNumberValidator } from 'konva/lib/Validators';

function Coldness(imageData) {

  const coldnessValue = this.coldness();
  const pixels = imageData.data; //  [0, 1, 2, 3,...] => [r, g, b, a, ...]
  const len = pixels.length;

  for (let i = 0; i < len; i += 4) {
    pixels[i] -= coldnessValue; // red
    pixels[i + 2] += coldnessValue; // blue
  }
}

Coldness.finetuneName = 'Coldness'; // We assign the finetune name here instead of using the fn. name as on prod. code the fn. name is optimized that might cause bug in that case.

export default Coldness;

/**
 * adds coolness parameter (0 - 200), 0 means no value... 200 max value.
 */
KonvaFactory.addGetterSetter(
  Konva.Image,
  'coldness',
  0,
  konvaGetNumberValidator(),
  KonvaFactory.afterSetFilter,
);
