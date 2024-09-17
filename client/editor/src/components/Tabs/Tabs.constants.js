import transformIcon from './icons/transform.svg';
import adjustmentsIcon from './icons/adjustments.svg';
import filtersIcon from './icons/filters.svg';
import resizeIcon from './icons/resize.svg';
import textIcon from './icons/text.svg';
import shapesIcon from './icons/shapes.svg';
import paintIcon from './icons/paint.svg';
import blendIcon from './icons/blend.svg';
import effectsIcon from './icons/effects.svg';

export const TABS_IDS = {
  ADJUST: 'Adjust',
  FILTERS: 'Filters',
  TRANSFORM: 'Transform',
  WATERMARK: 'Watermark',
  ANNOTATE: 'Annotate',
  RESIZE: 'Resize',
  SHAPES: 'Shapes',
  PAINT: 'Paint',
  BLEND: 'Blend',
  EFFECTS: 'Effects'
};

export const AVAILABLE_TABS = [
  {
    id: TABS_IDS.TRANSFORM,
    label: 'Transform',
    title: 'Change image size and orientation.',
    icon: transformIcon,
  },
  {
    id: TABS_IDS.ADJUST,
    label: 'Adjust',
    title: 'Adjust image color properties.',
    icon: adjustmentsIcon,
  },
  {
    id: TABS_IDS.FILTERS,
    label: 'Filters',
    icon: filtersIcon,
    title: 'Apply a color filter to image.',
    hideFn: ({ useCloudImage }) => useCloudImage,
  },
  {
    id: TABS_IDS.ANNOTATE,
    label: 'Text',
    icon: textIcon,
    title: 'Insert text to image.',
    hideFn: ({ useCloudImage }) => useCloudImage,
  },
  {
    id: TABS_IDS.RESIZE,
    label: 'Resize',
    title: 'Expand or shrink the canvas.',
    icon: resizeIcon,
  },
  {
    id: TABS_IDS.SHAPES,
    label: 'Shapes',
    title: 'Insert geometric shapes to image.',
    icon: shapesIcon,
  },
  {
    id: TABS_IDS.PAINT,
    label: 'Paint',
    title: 'Draw custom stokes to image.',
    icon: paintIcon,
  },
  {
    id: TABS_IDS.BLEND,
    label: 'Blend',
    title: 'Blend multiple images into one.',
    icon: blendIcon,
  },
  {
    id: TABS_IDS.EFFECTS,
    label: 'Effects',
    title: 'Apply various effects to image.',
    icon: effectsIcon,
  },
];
