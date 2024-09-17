/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import Icon from './icon.svg';
import { IconButton } from 'components/common/Buttons';
import { TOOLS_IDS } from 'utils/constants';

const Warmth = ({ selectTool, isSelected }) => (
  <IconButton
    id={TOOLS_IDS.WARMTH}
    label='Warmth'
    icon={Icon}
    onClickHandler={selectTool}
    isSelected={isSelected}
  />
);

Warmth.defaultProps = {
  isSelected: false
};

Warmth.propTypes = {
  selectTool: PropTypes.func.isRequired,
  isSelected: PropTypes.bool
};

export default Warmth;