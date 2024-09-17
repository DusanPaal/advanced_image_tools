/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import { useFinetune } from 'hooks';
import restrictNumber from 'utils/restrictNumber';
import { Coldness as CustomColdness } from 'custom/adjustments';
import Slider from 'components/common/Slider';
import {
  StyledSliderContainer,
  StyledSliderInput,
  StyledSliderLabel,
  StyledSliderWrapper,
} from '../tools.styled';

const MIN_VALUE = 0;
const MAX_VALUE = 20;
const DEFAULT_VALUE = {
  coldness: MIN_VALUE,
};

const sliderStyle = { width: 150, padding: 0, margin: 0 };

const ColdnessOptions = () => {

  const [finetuneProps, setFinetuneProps] = useFinetune(
    CustomColdness, DEFAULT_VALUE
  );

  const changeValue = (value) => {
    setFinetuneProps({
      coldness: restrictNumber(value, MIN_VALUE, MAX_VALUE),
    });
  };

  return (
    <StyledSliderContainer className="FIE_warmth-option-wrapper">
      <StyledSliderLabel className="FIE_warmth-option-label">
        Coldness
      </StyledSliderLabel>
      <StyledSliderWrapper>
        <Slider
          className="FIE_warmth-option"
          min={MIN_VALUE}
          max={MAX_VALUE}
          width="124px"
          value={finetuneProps.coldness ?? DEFAULT_VALUE.coldness}
          onChange={changeValue}
          style={sliderStyle}
        />
        <StyledSliderInput
          value={finetuneProps.coldness ?? DEFAULT_VALUE.coldness}
          onChange={({ target: { value } }) => changeValue(value)}
        />
      </StyledSliderWrapper>
    </StyledSliderContainer>
  );
};

export default ColdnessOptions;
