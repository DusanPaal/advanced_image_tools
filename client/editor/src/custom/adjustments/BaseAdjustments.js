
const BaseAdjustments = {

  /**
  * @brief
  * Applies a series of filters to the image's pixel data.
  * The function modifies the image data in place.
  *
  * @param {ImageData} imageData
  * The image data containing the pixel array that will be processed.
  * The `imageData.data` property is a flat array representing the pixel
  * values in RGBA format. Each group of four values represents a pixel with:
  *   - `pixels[i]`   : Red value (0-255)
  *   - `pixels[i+1]` : Green value (0-255)
  *   - `pixels[i+2]` : Blue value (0-255)
  *   - `pixels[i+3]` : Alpha value (0-255)
  *
  * @param {...function} filters
  * One or more filter functions that take an array representing
  * a pixel's RGB values and return an adjusted RGB array.
  *   - Each filter function is applied in sequence to every pixel.
  *   - The filter is called with `[R, G, B]` and should return `[R', G', B']`.
  */
  apply: (imageData, ...filters) => {

    const pixels = imageData.data; //  [0, 1, 2, 3,...] => [r, g, b, a, ...]
    const len = pixels.length;

    for (let i = 0; i < len; i += 4) {
      for (const filter of filters) {
        [pixels[i], pixels[i + 1], pixels[i + 2]] = filter(
          [pixels[i], pixels[i + 1], pixels[i + 2]],
        );
      };
    }
  },

  warmth: (value) => (pixelRGB) => {

    const newPixelRGB = [
      pixelRGB[i] += value,
      pixelRGB[i + 1],
      pixelRGB[i + 2] -= value
    ];

    // Clamp the values between 0 and 255
    newPixelRGB.map(channel => Math.max(0, Math.min(255, channel)));

    return newPixelRGB;

  },

  //blur_box: 
    // implement box blur
    // https://en.wikipedia.org/wiki/Box_blur
    // https://www.geeksforgeeks.org/box-blur-algorithm-image-processing/




  threshold_binary: (value) => (pixelRGB) => {

    return [
      pixelRGB[i] >= value ? 255 : 0,
      pixelRGB[i + 1] >= value ? 255 : 0,
      pixelRGB[i + 2] >= value ? 255 : 0
    ];

  },

  threshold_grayscale: (value) => (pixelRGB) => {

    const thresholdValue = value;
    const r = pixelRGB[0];
    const g = pixelRGB[1];
    const b = pixelRGB[2];

    const isWhite = (r + g + b) / 3 > thresholdValue;
    const val = isWhite ? 255 : 0;

    return [val, val, val];

  },

  /**
  * @brief
  * Adjusts the brightness of a pixel.
  *
  * @param {number} value
  * The brightness adjustment factor, ranging from -1 to 1.
  *   - A value of `-1` makes the pixel completely dark.
  *   - A value of `1` makes the pixel fully bright.
  *   - A value of `0` leaves the brightness unchanged.
  *
  * @param {number[]} pixelRGB
  * The pixel's RGB values as an array [R, G, B], where:
  *   - R, G, and B are numbers between 0 and 255.
  *   - These represent the red, green, and blue
  *     channels of the pixel.
  *
  * @returns {number[]}
  * The adjusted pixel's RGB values, where
  * each value is clamped between 0 and 255.
  */
  brightness: (value) => (pixelRGB) => {

    let currentValue = value;

    // Ensure value is clamped between -1 and 1
    currentValue = currentValue > 1 ? 1 : currentValue;
    currentValue = currentValue < -1 ? -1 : currentValue;

    // Scale the adjusted value to the range of -255 to 255
    // NOTE: impmelent as bitwise operation if performance
    // decrease is observed for large images
    currentValue = Math.round(currentValue * 255);

    // compile a new pixel with adjusted brightness
    const newPixelRGB = [
      pixelRGB[0] + currentValue,
      pixelRGB[1] + currentValue,
      pixelRGB[2] + currentValue,
    ];

    // Clamp the values between 0 and 255
    newPixelRGB.map(channel => Math.max(0, Math.min(255, channel)));

    // return the new pixel
    return newPixelRGB

  },


  /**
  * @brief
  * Adjusts the contrast of a pixel.
  *
  * @param {number} value : TODO: implement the value range -1 to 1 as for brightness
  * The contrast adjustment factor, ranging from -100 to 100.
  * - A value of `-100` makes the pixel completely gray.
  * - A value of `100` makes the pixel fully contrasted.
  * - A value of `0` leaves the contrast unchanged.
  *
  * @param {number[]} pixelRGB
  * The pixel's RGB values as an array [R, G, B], where:
  *  - R, G, and B are numbers between 0 and 255.
  *  - These represent the red, green, and blue
  *    channels of the pixel.
  *
  * @returns {number[]}
  * The adjusted pixel's RGB values, where
  * each value is clamped between 0 and 255.
  */
  contrast: (value) => (pixelRGB) => {

    let currentValue = value;

    // Ensure value is clamped between -100 and 100
    currentValue = currentValue > 100 ? 100 : currentValue;
    currentValue = currentValue < -100 ? -100 : currentValue;

    // Scale the adjusted value to the range of -255 to 255
    currentValue *= 255;

    // Calculate the factor by which to adjust the pixel's contrast
    const factor = (259 * (currentValue + 255)) / (255 * (259 - currentValue));

    // compile a new pixel with adjusted contrast
    const newPixelRGB = [
      factor * (pixelRGB[0] - 128) + 128,
      factor * (pixelRGB[1] - 128) + 128,
      factor * (pixelRGB[2] - 128) + 128,
    ];

    // Clamp the values between 0 and 255
    newPixelRGB.map(channel => Math.max(0, Math.min(255, channel)));

    return newPixelRGB;

  },


  /**
  * @brief
  * Adjusts the saturation of a pixel.
  *
  * @param {number} value
  * The saturation adjustment factor, ranging from -100 to 100.
  *   - A value of `-1` makes the pixel completely gray.
  *   - A value of `1` makes the pixel fully saturation.
  *   - A value of `0` leaves the saturation unchanged.
  *
  * @param {number[]} pixelRGB
  * The pixel's RGB values as an array [R, G, B], where:
  *   - R, G, and B are numbers between 0 and 255.
  *   - These represent the red, green, and blue
  *     channels of the pixel.
  *
  * @returns {number[]}
  * The adjusted pixel's RGB values, where
  * each value is clamped between 0 and 255.
  */
  saturation: (value) => (pixelRGB) => {

    let currentValue = value;

    // Ensure value is above -1
    currentValue = currentValue < -1 ? -1 : currentValue;

    // calculate the average of the pixel's RGB values;
    // the weights come from CCIR 601 specification
    const r = pixelRGB[0];
    const g = pixelRGB[1];
    const b = pixelRGB[2];

    const gray = 0.2989 * r + 0.587 * g + 0.114 * b;

    // compile a new pixel with adjusted saturation
    const newPixelRGB = [
      -gray * currentValue + r * (1 + currentValue),
      -gray * currentValue + g * (1 + currentValue),
      -gray * currentValue + b * (1 + currentValue),
    ];

    // Clamp the values between 0 and 255
    newPixelRGB.map(channel => Math.max(0, Math.min(255, channel)));

    return newPixelRGB;

  },


  /**
  * @brief
  * Converts a pixel to grayscale.
  *
  * @param {number[]} pixelRGB
  * The pixel's RGB values as an array [R, G, B], where:
  *   - R, G, and B are numbers between 0 and 255.
  *   - These represent the red, green, and blue
  *     channels of the pixel.
  *
  * @returns {number[]}
  *    The converted pixel's RGB values, where
  *    each value is clamped between 0 and 255.
  */
  grayscale: () => (pixelRGB) => {

    // calculate the average of the pixel's RGB values
    const r = pixelRGB[0];
    const g = pixelRGB[1];
    const b = pixelRGB[2];

    let average = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // clamp te average value between 0 and 255
    average = Math.min(255, average);

    // return the average value for each channel
    return new Array(3).fill(average);
  },


  /**
  * @brief
  * Inverts the colors of a pixel.
  *
  * @param {number} value
  *
  * @param {number[]} pixelRGB
  * The pixel's RGB values as an array [R, G, B], where:
  *  - R, G, and B are numbers between 0 and 255.
  *  - These represent the red, green, and blue channels
  *    of the pixel.
  *
  * @returns {number[]}
  *    The converted pixel's RGB values, where
  *    each value is clamped between 0 and 255.
  */
  sepia: (value) => (pixelRGB) => {

    const r = pixelRGB[0];
    const g = pixelRGB[1];
    const b = pixelRGB[2];

    // compile a new pixel with adjusted sepia
    const newPixelRGB = [
			r * (1 - 0.607 * value) + g * 0.769 * value + b * 0.189 * value,
			r * 0.349 * value + g * (1 - 0.314 * value) + b * 0.168 * value,
			r * 0.272 * value + g * 0.534 * value + b * (1 - 0.869 * value),
		];

    // Clamp the values between 0 and 255
    newPixelRGB.map(channel => Math.max(0, Math.min(255, channel)));

    return newPixelRGB;

  },


  /**
   * Adjusts the RGB values of a pixel by multiplying
   * each component by a corresponding factor.
   *
   * @param {Array<number>} adjustingRGB
   * An array representing the adjustment factors for each RGB component.
   *    - The first element is the red adjustment factor.
   *    - The second element is the green adjustment factor.
   *    - The third element is the blue adjustment factor.
   *   *
   * @param {Array<number>} pixelRGB
   * An array representing the RGB values of a pixel to be adjusted.
   *     - The first element is the red component of the pixel (0-255).
   *     - The second element is the green component of the pixel (0-255).
   *     - The third element is the blue component of the pixel (0-255).
   *
   * @returns {Array<number>}
   * An array representing the new RGB values of the pixel after the adjustment.
   *     - The red value is multiplied by the red adjustment factor.
   *     - The green value is multiplied by the green adjustment factor.
   *     - The blue value is multiplied by the blue adjustment factor.
   */
  adjustRGB: (adjustingRGB) => (pixelRGB) => [
    pixelRGB[0] * adjustingRGB[0], // R
    pixelRGB[1] * adjustingRGB[1], // G
    pixelRGB[2] * adjustingRGB[2], // B
  ],


  /**
   * @brief
   * Applies color filter to a given pixel by blending
   * its original RGB values with the target RGB color,
   * based on the target color intensity.
   *
   * @param {Array<number>} colorRGBV
   * An array representing the target color and intensity.
   *   - The first element is the red component of the target color (0-255).
   *   - The second element is the green component of the target color (0-255).
   *   - The third element is the blue component of the target color (0-255).
   *   - The fourth element is the filter intensity value (0-1), where 0 means
   *     no change and 1 means full application of the target color.
   *
   * @param {Array<number>} pixelRGB
   * An array representing the RGB values of a pixel to be filtered.
   *   - The first element is the red component of the pixel (0-255).
   *   - The second element is the green component of the pixel (0-255).
   *   - The third element is the blue component of the pixel (0-255).
   *
   * @returns {Array<number>}
   * An array representing the new RGB values of the pixel.
   *
   */
  colorFilter: (colorRGBV) => (pixelRGB) => {

    const r = pixelRGB[0];
    const g = pixelRGB[1];
    const b = pixelRGB[2];
    const value = colorRGBV[3];

    return [
      r - (r - colorRGBV[0]) * value,
      g - (g - colorRGBV[1]) * value,
      b - (b - colorRGBV[2]) * value,
    ];

  },

};

export default BaseAdjustments;