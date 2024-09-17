import { memo } from 'react';
import styles from './TabButton.module.css';

const TabButton = ({
	label,
	title,
	icon,
	id,
	style='green',
	isDisabled=false,
	isSelected,
	onClickHandler
}) => {

	// validate button text
	if (!label) {
		throw new Error('Button label not found!');
	}

	if (!(icon && icon.split('?')[0].endsWith('.svg'))) {
		throw new Error(
			'Invalid button icon! Only SVG images can be used as icons.'
		);
	}

	// validate button style
	if (!['green', 'red'].includes(style)) {
		throw new Error(`Unrecognized button style: '${style}'`);
	}

	// validate button ID
	if (!id) {
		throw new Error('Button ID is missing!');
	}

	const handleClick = (event) => {
		onClickHandler(id, event);
	}

	// render the button
	return (
		<div
			title={title}
			className={styles.button}
			id={id}
			data-selected={isSelected}
			data-style={style}
			data-disabled={isDisabled}
			onClick={handleClick}
		>
			<img className={styles.icon} src={icon} alt='Icon' />
			<label className={styles.label}>{label}</label>
		</div>
	);

};

export default memo(TabButton);