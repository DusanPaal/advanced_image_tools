/** External Dependencies */
import React from 'react';
import CrossOutline from '@scaleflex/icons/cross-outline';
import Button from '@scaleflex/ui/core/button';
import styled from 'styled-components';

/** Internal Dependencies */
import { useStore } from 'hooks';
import Separator from 'components/common/Separator';
import ConfirmationModal from './ConfirmationModal';

const StyledCloseButton = styled(Button)`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  padding: 4px 12px;
  background-color: #454545;
  border-radius: 0.2em;
  color: #8ECCC1;
  font-size: 10px;
`;

const CloseButton = () => {
  const {
    config: { onClose },
  } = useStore();

  if (typeof onClose !== 'function') {
    return null;
  }

  return (
    <>
      <ConfirmationModal>
        <StyledCloseButton
          className="FIE_topbar-close-button"
          size="md"
        >
          Close
        </StyledCloseButton>
      </ConfirmationModal>
    </>
  );
};

export default CloseButton;
