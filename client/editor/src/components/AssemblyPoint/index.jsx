/** External Dependencies */
import React, { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import ThemeProvider from '@scaleflex/ui/theme';

/** Internal Dependencies */
import App from 'components/App';
import { AppProvider } from 'context';
import defaultConfig from 'context/defaultConfig';
import deepMerge from 'utils/deepMerge';
import assignFinetuneNamesToKonva from 'utils/assignFinetuneNamesToKonva';
import { FontsFaces, OverrideDefaultStyles } from './globalStyles';

/**
 * @brief
 * AssemblyPoint function is the main entry point for the image editor.
 * It is responsible for providing the context to the whole application.
 * by assembling the App, and the AppProvider components.
 *
 * @param {Object} props
 * @param {string | HTMLImageElement} props.source - The image that will be edited.
 * @param {boolean} props.useCloudImage - If true, the image will be processed by Cloudimage.
 * @param {Object} props.cloudimage - Cloudimage configuration object.
 */
const AssemblyPoint = (props) => {

  const { source, useCloudImage, cloudimage } = props;

  // Check if source is provided and if so, it is a string or an HTMLImageElement
  if (!source || (typeof source !== 'string' && !(source instanceof HTMLImageElement))) {
    throw new Error(
      '`source` property is required either a string of image url or a HTMLImageElement for the image that will be edited.',
    );
  }

  // Check if cloud image is enabled and if it is, check if the salt is provided
  if (useCloudImage) {
    if (cloudimage?.imageSealing?.enable && !cloudimage?.imageSealing?.salt) {
      throw new Error(
        '`salt` property of imageSealing object is required in cloudimage mode as long as `imageSealing` is enabled.',
      );
    }
  }

  useEffect(() => { assignFinetuneNamesToKonva();}, [])

  // override the default config with the provided properties
  const defaultAndProvidedConfigMerged = deepMerge(defaultConfig, props);

  // return the assembled main entry point of the image editor
  return (
    <React.StrictMode>
      <ThemeProvider theme={defaultAndProvidedConfigMerged.theme}>
        <FontsFaces />
        <OverrideDefaultStyles />
        <AppProvider config={defaultAndProvidedConfigMerged}>
          <App />
        </AppProvider>
      </ThemeProvider>
    </React.StrictMode>
  );

};

AssemblyPoint.defaultProps = {
  useCloudImage: false, // tu by mala byt praveze len cloudimage moznost, na zaklade ktorej sa bude rozhodovat ci sa ma pouzit cloudimage alebo nie
  cloudimage: {},
};

AssemblyPoint.propTypes = {
  source: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(HTMLImageElement),
    PropTypes.instanceOf(SVGImageElement),
    PropTypes.instanceOf(ImageBitmap),
  ]).isRequired,
  useCloudImage: PropTypes.bool,
  cloudimage: PropTypes.instanceOf(Object),
};

// export memoized assembly point
export default memo(AssemblyPoint);
