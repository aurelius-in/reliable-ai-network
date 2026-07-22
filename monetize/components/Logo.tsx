import Link from "next/link";

/**
 * Header lockup: full Make it RAIN wordmark (logo1).
 * App icon / PWA mark stays the glass squircle (button_cool).
 */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex w-fit items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.png"
        alt="Make it RAIN"
        width={168}
        height={56}
        className="h-9 w-auto object-contain sm:h-10"
      />
    </Link>
  );
}
