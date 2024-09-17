import React from 'react';
import PropTypes from 'prop-types';
import styles from './Spinner.module.css';

const Spinner = () => {
  return (
    <div className={styles.wrapper}>
      <svg
        viewBox="0 0 50 50"
        className={styles.spinner}
      >
        <circle
          className={styles.path}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
        ></circle>
      </svg>
    </div>
  );
};

Spinner.defaultProps = {
  theme: {},
};

Spinner.propTypes = {
  theme: PropTypes.instanceOf(Object),
};

export default Spinner;