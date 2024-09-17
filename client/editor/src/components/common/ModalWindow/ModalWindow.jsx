import { useEffect, useRef } from 'react';
import styles from './ModalWindow.module.css';
import { ControlButton } from 'components/common/Buttons';

const ModalWindow = ({
  type,
  message,
  level,
  title,
  handleClickYes,
  handleClickNo,
  handleClickOk,
  handleCloseWindow
}) => {

  // validate the modal type
  const isOkModal = type === 'OK';
  const isYesNoModal = type === 'YesNo';

  if (!(isOkModal || isYesNoModal)) {
    throw new Error(`Unrecognized modal type: '${type}'`);
  }

  // validate the window message
  if (!message) {
    throw new Error(`No message to display!`);
  }

  // validate the message level
  const normLevel = level.toLowerCase();

  if (!['warning', 'info', 'error'].includes(normLevel)) {
    throw new Error(`Unrecognized message level: '${normLevel}'`);
  }

  // validate the window title
  if (!title) {
    throw new Error(`Modal title is missing!`);
  }

  const handlePressKey = (event) => {
    if (event.key === 'Escape') {
      // close the window
      handleCloseWindow();
    } else if (event.key === 'Enter') {
      // confirm the active button (for this case we assume OK click)
      if (isOkModal) {
        handleClickOk();
      }
    }
  };

  // useRef to focus the modal
  const modalRef = useRef(null); 

  // Set focus on the modal when it's rendered
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  // render the modal window
  return (
    <div
      className={styles.window}
      tabIndex={0}  // Make the modal focusable
      onKeyDown={handlePressKey}
      ref={modalRef} // Set ref to enable focusing
    >
      <span className={styles.title}>{title}</span>
      <span type={normLevel} className={styles.message}>{message}</span>
      {isYesNoModal && (
        <div className={styles.buttons}>
          <ControlButton
            title='Yes'
            type='button'
            style='green'
            onClickHandler={handleClickYes}
          />
          <ControlButton
            title='No'
            type='button'
            style='green'
            onClickHandler={handleClickNo}
          />
        </div>
      )}
      {isOkModal && (
        <div className={styles.buttons}>
          <button
            type='button'
            className={styles.button}
            onClick={handleClickOk}
          >
            Ok
          </button>
        </div>
      )}
    </div>
  );
}

export default ModalWindow;