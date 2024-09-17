import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import TabButton from 'components/common/Buttons/TabButton';

const Tab = ({ id, label, title, icon, isSelected, onClick }) => {

  const handleClick = useCallback(() => onClick(id), [id]);

  return (
    <TabButton 
      id={id}
      label={label}
      title={title}
      icon={icon}
      isSelected={isSelected}
      onClickHandler={handleClick}
    />
  );

};

Tab.defaultProps = {
  isSelected: false,
  onClick: undefined,
  label: undefined,
};

Tab.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  icon: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.instanceOf(Object),
  ]).isRequired,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
};

export default memo(Tab);