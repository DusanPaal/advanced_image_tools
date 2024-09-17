/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import { usePhoneScreen, useStore } from 'hooks';
import { Menu } from '@scaleflex/icons';
import CloseButton from './CloseButton';
import StyledSaveButton from './DownloadButton';
import UploadButton from './UploadButton';
import SaveButton from './SaveButton';
import HomeButton from './HomeButton';
import ResetButton from './ResetButton';
import UndoButton from './UndoButton';
import RedoButton from './RedoButton';
import ImageDimensionsAndDisplayToggle from './ImageDimensionsAndDisplayToggle';
import {
  StyledTopbar,
  StyledFlexCenterAlignedContainer,
  StyledMainButtonsWrapper,
  StyledControlButtonsWrapper,
  StyledHistoryButtons,
  StyledMenuIconButton,
} from './Topbar.styled';
import BackButton from './BackButton';

const Topbar = ({ toggleMainMenu }) => {
  const {
    config: { showBackButton },
  } = useStore();

  const isPhoneScreen = usePhoneScreen(320);
  const server_endpoint_url = 'http://localhost:5000/upload_image'; // refaktorovat ako parameter funkcie

  return (
    <StyledTopbar className="FIE_topbar" isPhoneScreen={isPhoneScreen}>
      <StyledMainButtonsWrapper className="FIE_topbar-buttons-wrapper">
        <StyledMenuIconButton
          className="FIE_tabs_toggle_btn"
          size={isPhoneScreen ? 'sm' : 'lg'}
          color="basic"
          onClick={() => toggleMainMenu(true)}
        >
          {(props) => <Menu {...props} />}
        </StyledMenuIconButton>
        {showBackButton ? <BackButton /> : <StyledSaveButton />}
        <HomeButton homeUrl='http://localhost:5000/home' />
        <UploadButton endpoint_url={server_endpoint_url} />
        <SaveButton endpoint_url={server_endpoint_url} />
      </StyledMainButtonsWrapper>

      <StyledFlexCenterAlignedContainer
        className="FIE_topbar-center-options"
        showBackButton={showBackButton}
      >
        <ImageDimensionsAndDisplayToggle
          showBackButton={showBackButton}
          isPhoneScreen={isPhoneScreen}
        />
      </StyledFlexCenterAlignedContainer>

      <StyledControlButtonsWrapper>
        <StyledHistoryButtons className="FIE_topbar-history-buttons">
          <ResetButton margin="0" showBackButton={showBackButton} />
          <UndoButton margin="0" showBackButton={showBackButton} />
          <RedoButton margin="0" showBackButton={showBackButton} />
        </StyledHistoryButtons>

        {showBackButton ? <StyledSaveButton /> : <CloseButton />}
      </StyledControlButtonsWrapper>
    </StyledTopbar>
  );
};

Topbar.defaultProps = {
  toggleMainMenu: () => {},
};

Topbar.propTypes = {
  toggleMainMenu: PropTypes.func,
};

export default Topbar;
