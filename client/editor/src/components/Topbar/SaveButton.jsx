/** External Dependencies */
import React from 'react';
import { useState } from 'react';

/** Internal Dependencies */
import { ControlButton } from 'components/common/Buttons'

/**
 * Button to save the currently edited image to the server.
 */
const SaveButton = ({endpoint_url}) => {

  const [message, setMessage] = useState('');
  const [isHiddenMessage, setIsHiddenMessage] = useState(true);
  const [messageLevel, setMessageLevel] = useState('info');
  const [isModalClosed, setIsModalClosed] = useState(true);

  const storeImage = async (fileName, imgData) => {

    try {

      const response = await fetch(endpoint_url, {
        method: "POST",
        body: JSON.stringify({ image: imgData, filename: fileName }), // Send base64 data
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setMessage('Image saved successfully!');
        setIsHiddenMessage(false);
        setMessageLevel('info');
      } else {
        response.text().then(text => {
          setMessage(`Error saving image: ${text}`);
          setIsHiddenMessage(false);
          setMessageLevel('error');
        });
      }

    } catch (error) {
      setMessage(`Error saving image: ${error}`);
      setIsHiddenMessage(false);
      setMessageLevel('error');
    }

  };

  const selectLocalFile = () => {

    // pick local image using a open file 
    // dialog and upload to the server
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
   
    input.onchange = (event) => {
      const file = event.target.files[0];
			const reader = new FileReader();
      reader.onload = (event) => {
        storeImage(file.name, event.target.result);
			};
			reader.readAsDataURL(file);
		};

  };

  const handleClickOk = () => {
    setIsHiddenMessage(true);
  }

  const handleCloseWindow = () => {
    setIsModalClosed(true);
  }

  return (
    <>
      <ControlButton
        title='Save'
        type='button'
        style='green'
        onClick={selectLocalFile}
       />
      {!(isHiddenMessage || (!isModalClosed)) && (
        <ModalWindow
          type='OK'
          message={message}
          title='Image saving status'
          level={messageLevel}
          handleClickOk={handleClickOk}
          handleCloseWindow={handleCloseWindow}
        />
      )}
    </>
  );

};

export default SaveButton;
