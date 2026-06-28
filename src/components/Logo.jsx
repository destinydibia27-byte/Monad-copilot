export function MonadLogo({ size = 32, radius = 9 }) {
  const s = size;
  const r = radius;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx={r} fill="#13123A"/>
      {/* Outer triangle outline */}
      <path d="M16 6L27 25H5L16 6Z" stroke="#836EF9" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      {/* Inner filled white triangle */}
      <path d="M16 11L23 22H9L16 11Z" fill="white"/>
      {/* Bottom line */}
      <line x1="12" y1="27" x2="20" y2="27" stroke="#836EF9" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
