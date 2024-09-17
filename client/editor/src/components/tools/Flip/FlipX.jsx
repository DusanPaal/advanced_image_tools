/** External Dependencies */
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FlipX as FlipXIcon } from '@scaleflex/icons/flip-x';

/** Internal Dependencies */
import ToolsBarItemButton from 'components/ToolsBar/ToolsBarItemButton';
import { FLIP_DIRECTIONS, TOOLS_IDS } from 'utils/constants';
import { TOGGLE_FLIP } from 'actions';
import { usePhoneScreen, useStore } from 'hooks';

const xFlipReverseSideStyle = {
  transform: 'scaleX(-1)',
};

const FlipX = ({ selectTool, isSelected}) => {
  const {
    dispatch,
    adjustments: { isFlippedX },
  } = useStore();

  const isPhoneScreen = usePhoneScreen(320);

  const { reverseLabelOfCurrXFlipDir, reverseIconOfCurrXFlipDir } = useMemo(
    () => ({
      reverseLabelOfCurrXFlipDir: isFlippedX ? 'Un-Flip X' : 'Flip X',
      reverseIconOfCurrXFlipDir: () => (
        <FlipXIcon
          size={isPhoneScreen ? 20 : 16}
          style={isFlippedX ? xFlipReverseSideStyle : undefined}
        />
      ),
    }),
    [isFlippedX],
  );

  const toggleFlipX = useCallback(() => {
    dispatch({
      type: TOGGLE_FLIP,
      payload: {
        direction: FLIP_DIRECTIONS.X,
      },
    });
  }, []);

  const handleButtonClick = useCallback((flipXToolId) => {
    selectTool(flipXToolId);
    toggleFlipX();
  }, []);

  return (
    <ToolsBarItemButton
      className="FIE_flip-x-tool-button"
      id={TOOLS_IDS.FLIP_X}
      label={reverseLabelOfCurrXFlipDir}
      Icon={reverseIconOfCurrXFlipDir}
      onClick={handleButtonClick}
      isSelected={isSelected}
    />
  );
};

FlipX.defaultProps = {
  isSelected: false,
};

FlipX.propTypes = {
  selectTool: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default FlipX;
