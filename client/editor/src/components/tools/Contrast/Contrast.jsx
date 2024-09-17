/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import Icon from './icon.svg';
import { IconButton } from 'components/common/Buttons';
import { TOOLS_IDS } from 'utils/constants';

const Contrast = ({ selectTool, isSelected }) => (
  <IconButton
    id={TOOLS_IDS.CONTRAST}
    label='Contrast'
    icon={Icon}
    onClickHandler={selectTool}
    isSelected={isSelected}
  />
);

Contrast.defaultProps = {
  isSelected: false,
};

Contrast.propTypes = {
  selectTool: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default Contrast;