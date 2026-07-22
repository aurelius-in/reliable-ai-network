/**
 * Small glassy raindrop accent for bullets / inline markers.
 * Use instead of a full logo or lucide sparkle where a tiny brand hit fits.
 */
export function RainBullet({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/bullet.png"
      alt=""
      width={size}
      height={size}
      aria-hidden
      className={`inline-block shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
