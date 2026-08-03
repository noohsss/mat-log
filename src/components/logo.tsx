export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* spiral binder rings */}
      <rect x="6" y="14" width="10" height="5" rx="2.5" fill="#2b2b2b" />
      <rect x="6" y="29.5" width="10" height="5" rx="2.5" fill="#2b2b2b" />
      <rect x="6" y="45" width="10" height="5" rx="2.5" fill="#2b2b2b" />

      {/* notebook page with folded corner */}
      <path
        d="M16 8a4 4 0 0 1 4-4h22l8 8v44a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V8Z"
        fill="#f2542d"
      />
      <path d="M42 4l8 8h-6a2 2 0 0 1-2-2V4Z" fill="#ffffff" fillOpacity="0.55" />

      {/* fork */}
      <g fill="#fff5ee">
        <rect x="24.2" y="20" width="1.8" height="10" rx="0.9" />
        <rect x="27" y="20" width="1.8" height="10" rx="0.9" />
        <rect x="29.8" y="20" width="1.8" height="10" rx="0.9" />
        <path d="M24 29.5h7.6v2.2a3.8 3.8 0 0 1-3.8 3.8 3.8 3.8 0 0 1-3.8-3.8v-2.2Z" />
        <rect x="26.6" y="34.5" width="2.4" height="14" rx="1.2" />
      </g>

      {/* spoon + speech-bubble tail */}
      <g fill="#fff5ee">
        <ellipse cx="38.5" cy="26" rx="5.4" ry="7.2" />
        <path d="M38.5 33c-3.6 0-6.3 2.8-6.3 6.6 0 3.2 1.9 5.9 4.6 6.8-.3-1.6.1-3.2 1.1-4.4.6.9 1.6 1.6 2.8 1.8-.2-.9-.1-1.9.3-2.8 1.9-1.2 3.1-3.3 3.1-5.7v-.3c0-1.1-.4-2.1-1.1-2.9" />
      </g>
    </svg>
  );
}
