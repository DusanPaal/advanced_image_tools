/** External Dependencies */
import React from 'react';

/** Internal Dependencies */
import { useAnnotation } from 'hooks';
import { TOOLS_IDS } from 'utils/constants';
import AnnotationOptions from 'components/common/AnnotationOptions';

const EllipseOptions = () => {

  const [ellipse, saveEllipse] = useAnnotation({
    name: TOOLS_IDS.ELLIPSE,
  });

  return (
    <AnnotationOptions
      className="FIE_ellipse-tool-options"
      annotation={ellipse}
      updateAnnotation={saveEllipse}
    />
  );
};

export default EllipseOptions;
