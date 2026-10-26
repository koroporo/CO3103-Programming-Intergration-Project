export default function SvgIcon({
  name,
  size = 18,
  color = 'currentColor',
  className = '',
  style = {},
  ...props
}) {
  const symbolId = name.startsWith('icon-') || name.startsWith('app-') ? name : `icon-${name}`;

  return (
    <svg
      className={`svg-icon ${className}`}
      width={size}
      height={size}
      fill={color}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      {...props}
    >
      <use href={`/icons.svg#${symbolId}`} />
    </svg>
  );
}
