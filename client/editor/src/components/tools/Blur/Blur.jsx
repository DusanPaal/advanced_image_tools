/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import Icon from './icon.svg';
import { IconButton } from 'components/common/Buttons';
import { TOOLS_IDS } from 'utils/constants';

const Blur = ({ selectTool, isSelected }) => (
  <IconButton
    id={TOOLS_IDS.BLUR}
    label='Blur'
    icon={Icon}
    onClickHandler={selectTool}
    isSelected={isSelected}
  />
);

Blur.defaultProps = {
  isSelected: false,
};

Blur.propTypes = {
  selectTool: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default Blur;
