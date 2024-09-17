/** External Dependencies */
import React from 'react';

/** Internal Dependencies */
import { useFinetune } from 'hooks';
import restrictNumber from 'utils/restrictNumber';
import { Warmth as CustomWarmth } from 'custom/adjustments';
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
  warmth: MIN_VALUE,
};

const sliderStyle = { width: 150, padding: 0, margin: 0 };

const WarmthOptions = () => {

  const [finetuneProps, setFinetuneProps] = useFinetune(
    CustomWarmth, DEFAULT_VALUE
  );

  const changeValue = (value) => {
    setFinetuneProps({
      warmth: restrictNumber(value, MIN_VALUE, MAX_VALUE),
    });
  };

  return (
    <StyledSliderContainer className="FIE_warmth-option-wrapper">
      <StyledSliderLabel className="FIE_warmth-option-label">
        Warmth
      </StyledSliderLabel>
      <StyledSliderWrapper>
        <Slider
          className="FIE_warmth-option"
          min={MIN_VALUE}
          max={MAX_VALUE}
          width="124px"
          value={finetuneProps.warmth ?? DEFAULT_VALUE.warmth}
          onChange={changeValue}
          style={sliderStyle}
        />
        <StyledSliderInput
          value={finetuneProps.warmth ?? DEFAULT_VALUE.warmth}
          onChange={({ target: { value } }) => changeValue(value)}
        />
      </StyledSliderWrapper>
    </StyledSliderContainer>
  );
};

export default WarmthOptions;