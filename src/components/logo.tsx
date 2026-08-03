import { Jua } from "next/font/google";

const jua = Jua({ weight: "400", subsets: ["latin"], display: "swap" });

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 60"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* spiral binder rings */}
      <rect x="3" y="13" width="12" height="5" rx="2.5" fill="#3a2f28" />
      <rect x="3" y="27.5" width="12" height="5" rx="2.5" fill="#3a2f28" />
      <rect x="3" y="42" width="12" height="5" rx="2.5" fill="#3a2f28" />

      {/* notebook cover with folded corner (wider) */}
      <path
        d="M22 6H60L74 20V46A8 8 0 0 1 66 54H22A8 8 0 0 1 14 46V14A8 8 0 0 1 22 6Z"
        fill="#ff6a3d"
      />
      <path d="M60 6L74 20H66A6 6 0 0 1 60 14V6Z" fill="#ffffff" fillOpacity="0.35" />

      {/* fork */}
      <g fill="#fff6ef">
        <rect x="26" y="16" width="3" height="14" rx="1.5" />
        <rect x="31" y="16" width="3" height="14" rx="1.5" />
        <rect x="36" y="16" width="3" height="14" rx="1.5" />
        <rect x="26" y="27" width="13" height="6" rx="3" />
        <rect x="30.5" y="31" width="4" height="19" rx="2" />
      </g>

      {/* spoon */}
      <g fill="#fff6ef">
        <ellipse cx="54" cy="24" rx="7" ry="9" />
        <rect x="52" y="31" width="4" height="19" rx="2" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  textClassName,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className={markClassName ?? "h-9 w-12"} />
      <span
        className={`${jua.className} tracking-tight text-[#2b2b2b] ${
          textClassName ?? "text-2xl"
        }`}
      >
        맛<span className="text-[#ff6a3d]">log</span>
      </span>
    </div>
  );
}
