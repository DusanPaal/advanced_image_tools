/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import { useAnnotation } from 'hooks';
import { TOOLS_IDS } from 'utils/constants';
import TextControls from './TextControls';

const TextOptions = () => {
  const [text, saveText] = useAnnotation({ name: TOOLS_IDS.TEXT });
  return <TextControls text={text} saveText={saveText} />;
};

TextOptions.propTypes = {};

export default TextOptions;
