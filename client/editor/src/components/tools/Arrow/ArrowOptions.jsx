/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import { useAnnotation } from 'hooks';
import { TOOLS_IDS } from 'utils/constants';
import AnnotationOptions from 'components/common/AnnotationOptions';

const ArrowOptions = () => {
  const [arrow, saveArrow] = useAnnotation({
    name: TOOLS_IDS.ARROW,
  });

  return (
    <AnnotationOptions
      className="FIE_arrow-tool-options"
      annotation={arrow}
      updateAnnotation={saveArrow}
      hidePositionField
      hideFillOption
    />
  );
};

export default ArrowOptions;
