/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';
import { CropLandscape as RectIcon } from '@scaleflex/icons/crop-landscape';

/** Internal Dependencies */
import ToolsBarItemButton from 'components/ToolsBar/ToolsBarItemButton';
import { TOOLS_IDS } from 'utils/constants';

const RectButton = ({ selectTool, isSelected }) => (
  <ToolsBarItemButton
    className="FIE_rect-tool-button"
    id={TOOLS_IDS.RECT}
    label='Rectangle'
    Icon={RectIcon}
    onClick={selectTool}
    isSelected={isSelected}
  />
);

RectButton.defaultProps = {
  isSelected: false,
};

RectButton.propTypes = {
  selectTool: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default RectButton;
