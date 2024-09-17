import { memo } from 'react';
import styles from './ControlButton.module.css';

const ControlButton = ({
	title,
	type,
	style='green',
	disabled=false,
	onClickHandler
}) => {

	// validate button text
	if (!title) {
		throw new Error(`Button text not found!`);
	}

	// validate button type
	if (!['button', 'submit', 'reset'].includes(type)) {
		throw new Error(`Unrecognized button type: '${type}'`);
	}

	// validate button style
	if (!['green', 'red'].includes(style)) {
		throw new Error(`Unrecognized button style: '${style}'`);
	}

	// render the button
	return (
		<>
			<button
				className={styles.button}
				data-style={style}
				type={type}
				onClick={onClickHandler}
				disabled={disabled}
			>
				{title}
			</button>
		</>
	);

};

export default memo(ControlButton);