/** External Dependencies */
import React from 'react';
import { useState } from 'react';

/** Internal Dependencies */
import { ControlButton } from 'components/common/Buttons';
import ModalWindow from 'components/common/ModalWindow';
import readLocalFile from 'utils/readLocalFile';
import selectLocalFile from 'utils/selectLocalFile';
import storeFile from 'utils/storeFile'
import { FileUploadingError } from 'utils/errors'

const UploadButton = ({endpoint_url}) => {

  const [message, setMessage] = useState('');
  const [isHiddenMessage, setIsHiddenMessage] = useState(true);
  const [messageLevel, setMessageLevel] = useState('info');
  const [isModalClosed, setIsModalClosed] = useState(true);

  const uploadImage = async (fileName, imgData, endpoint) => {

    // store the image to the user data folder on the serveer
    try {
      await storeFile(fileName, imgData, endpoint);
      setMessage('Image uploaded successfully!');
      setIsHiddenMessage(false);
      setMessageLevel('info');
    } catch (error) {
      if (error instanceof FileUploadingError) {
        setMessage(`Could not upload image. ${error.message}`);
        setIsHiddenMessage(false);
        setMessageLevel('error');
      }
    }

  };

  // event handlers
  const handleClickOk = () => {
    setIsHiddenMessage(true);
  }

  const handleCloseWindow = () => {
    setIsModalClosed(true);
  }

  const handleUploadClick = async () => {
    const file = await selectLocalFile('image/*')
    const data = await readLocalFile(file)
    uploadImage(file.name, data, endpoint_url)
  }

  // render the button
  return (
    <>
      <ControlButton
        title='Upload'
        type='button'
        style='green'
        onClickHandler={handleUploadClick}
       />
      {!(isHiddenMessage || (!isModalClosed)) && (
        <ModalWindow
          type='OK'
          message={message}
          title='Image upload status'
          level={messageLevel}
          handleClickOk={handleClickOk}
          handleCloseWindow={handleCloseWindow}
        />
      )}
    </>
  );

};

export default UploadButton;