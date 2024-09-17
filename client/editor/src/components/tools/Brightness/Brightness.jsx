/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from 'components/common/Buttons';
import Icon from './icon.svg';

/** Internal Dependencies */
import { TOOLS_IDS } from 'utils/constants';

const Brightness = ({ selectTool, isSelected}) => (
  <IconButton
    id={TOOLS_IDS.BRIGHTNESS}
    label='Brightness'
    icon={Icon}
    onClickHandler={selectTool}
    isSelected={isSelected}
  />
);

Brightness.defaultProps = {
  isSelected: false,
};

Brightness.propTypes = {
  selectTool: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default Brightness;
