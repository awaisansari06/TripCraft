import Image from "next/image";
import Link from "next/link";
export default function Brand({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="TripCraft home"
      className={`tc-brand ${className}`}
    >
      <span className="tc-brand-symbol" aria-hidden="true">
        <Image
          src="/brand/tripcraft-symbol.png"
          alt=""
          width={44}
          height={44}
          className="tc-logo-light"
        />
        <Image
          src="/brand/tripcraft-symbol-dark.png"
          alt=""
          width={44}
          height={44}
          className="tc-logo-dark"
        />
      </span>
      <span>TripCraft</span>
    </Link>
  );
}
