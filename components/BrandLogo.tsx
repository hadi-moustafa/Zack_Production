import Image from "next/image";
import logo from "@/public/logo.png";
import { site } from "@/lib/site";

// The one way the logo is rendered anywhere on the site. Height is set by the
// caller (e.g. "h-12"); width follows the logo's 900×336 aspect ratio.
export default function BrandLogo({
  className = "h-12",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={logo}
      alt={site.name}
      priority={priority}
      sizes="(min-width: 640px) 172px, 129px"
      className={`w-auto ${className}`}
    />
  );
}
