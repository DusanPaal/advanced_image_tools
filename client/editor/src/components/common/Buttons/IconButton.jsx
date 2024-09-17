import { useState, memo } from 'react';
import styles from './IconButton.module.css';

const IconButton = ({
	label,
	icon,
	id,
	style='green',
	isDisabled=false,
	isSelected,
	onClickHandler
}) => {

	// validate button text
	if (!label) {
		throw new Error(`Button label not found!`);
	}

	// validate button style
	if (!['green', 'red'].includes(style)) {
		throw new Error(`Unrecognized button style: '${style}'`);
	}

	//const [isClicked, setIsClicked] = useState(false);

	const handleClick = (event) => {
		// toto zvazit na refaktoring - komponent
		// je v tesnej vazbe s externym onClickHandler
		// cim sa straca reusabilita a encapsulacia
		onClickHandler(id, event);
		// implementacia prepinania buttonov neskor, 
		// bude potrebne menit nejaky globalny state
		//setIsClicked(true); 
	};

	// render the button
	return (
		<div
			id={id}
			className={styles.button}
			data-selected={isSelected}
			data-style={style}
			data-disabled={isDisabled}
			onClick={handleClick}
		>
			<img src={icon} alt='Icon' />
			<label>{label}</label>
		</div>
	);

};

export default memo(IconButton);