
const Icon = ({
  svgImage,
  className,
  alt,
  title,
  width = 24,
  height = 24
}) => {

  return (
    <img
      src={svgImage}
      className={className}
      alt={alt}
      title={title}
      style={{ width, height }}
    />
  );

};

export default Icon;