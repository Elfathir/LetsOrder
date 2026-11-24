// Logo LetsOrder (lingkaran cokelat, huruf "L", panah oranye).
// SVG ini sebelumnya disalin persis di header dan di halaman auth.
export default function BrandLogo({ size = 38, className, style }) {
  return (
    <svg
      className={className || undefined}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      style={style}
    >
      <circle cx="50" cy="50" r="46" stroke="#D49354" strokeWidth="3" />
      <circle cx="50" cy="50" r="41" stroke="#E5B888" strokeWidth="1.5" />
      <path
        d="M33 26V40C33 44 36 46 39 46V74H43V46C46 46 49 44 49 40V26H46V38H44V26H38V38H36V26H33Z"
        fill="var(--maroon)"
      />
      <path
        d="M51 32L78 50L51 68V32Z"
        fill="#F8A34B"
        stroke="var(--maroon)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
