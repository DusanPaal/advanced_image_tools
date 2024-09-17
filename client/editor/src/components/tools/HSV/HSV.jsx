/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import Icon from './icon.svg';
import { IconButton } from 'components/common/Buttons';
import { TOOLS_IDS } from 'utils/constants';

const HSV = ({ selectTool, isSelected }) => (
    <IconButton
    id={TOOLS_IDS.HSV}
    label='HSV'
    icon={Icon}
    onClickHandler={selectTool}
    isSelected={isSelected}
  />
);

HSV.defaultProps = {
  isSelected: false,
};

HSV.propTypes = {
  selectTool: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default HSV;
