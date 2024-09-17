/** External Dependencies */
import React from 'react';
import { useState } from 'react';

/** Internal Dependencies */
import { ControlButton } from 'components/common/Buttons'
import ModalWindow from 'components/common/ModalWindow';


const HomeButton = ({ homeUrl }) => {

  const [isHiddenMessage, setIsHiddenMessage] = useState(true);

  const handleClickHome = () => {
    // redirect to home page
    setIsHiddenMessage(false);
  }

  const handleClickYes = () => {
    setIsHiddenMessage(true);
    // redirect to home page
    window.location.href = homeUrl;
  }

  const handleClickNo = () => {
    setIsHiddenMessage(true);
  }

  const handleCloseWindow = () => {
    setIsHiddenMessage(true);
  }

  // render the button
  return (
    <>
      <ControlButton
        title='Home'
        type='button'
        style='green'
        onClickHandler={handleClickHome}
       />
      {!isHiddenMessage && (
        <ModalWindow
          type='YesNo'
          message='Exit editor without saving changes?'
          title='Prompt'
          level='warning'
          handleClickYes={handleClickYes}
          handleClickNo={handleClickNo}
          handleCloseWindow={handleCloseWindow}
        />
      )}
    </>
  );

};

export default HomeButton;
