import Image from "next/image";

export default function BrandLogo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-xl bg-amber-400 ring-1 ring-white/15 ${className}`}>
      <Image src="/branding/muhammad-kashif.jpg" alt="Muhammad Kashif LMS logo" fill sizes="48px" className="object-cover object-top" />
    </span>
  );
}
