import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  width: 20,
  height: 20,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const PlayIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
    <path d="M8.2 4.9c0-.9.98-1.45 1.74-.98l10.2 6.1a1.15 1.15 0 0 1 0 1.96l-10.2 6.1A1.15 1.15 0 0 1 8.2 17.1V4.9Z" />
  </svg>
);

export const PauseIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
    <rect x="6" y="4" width="4.2" height="16" rx="1.4" />
    <rect x="13.8" y="4" width="4.2" height="16" rx="1.4" />
  </svg>
);

export const SkipNextIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
    <path d="M5.6 5.4c0-.85.92-1.37 1.64-.93l8.1 5.03c.66.41.66 1.38 0 1.79l-8.1 5.03c-.72.45-1.64-.07-1.64-.92V5.4Z" />
    <rect x="17.4" y="4.6" width="2.4" height="14.8" rx="1.2" />
  </svg>
);

export const SkipPrevIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
    <path d="M18.4 5.4c0-.85-.92-1.37-1.64-.93l-8.1 5.03c-.66.41-.66 1.38 0 1.79l8.1 5.03c.72.45 1.64-.07 1.64-.92V5.4Z" />
    <rect x="4.2" y="4.6" width="2.4" height="14.8" rx="1.2" />
  </svg>
);

export const ShuffleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 6.5h3.2c1.4 0 2.7.7 3.5 1.9l4.6 7.2c.8 1.2 2.1 1.9 3.5 1.9H21" />
    <path d="M3 17.5h3.2c1.4 0 2.7-.7 3.5-1.9l.9-1.4M15.2 8.3l.1-.2c.8-1.1 2.1-1.6 3.5-1.6H21" />
    <path d="m18.4 3.6 2.8 2.9-2.8 2.9M18.4 14.6l2.8 2.9-2.8 2.9" />
  </svg>
);

export const RepeatIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6.5 4.8h9A4 4 0 0 1 19.5 8.8v6.4" />
    <path d="M17.5 19.2h-9A4 4 0 0 1 4.5 15.2V8.8" />
    <path d="m14.9 16.6 2.6 2.6 2.6-2.6M9.1 7.4 6.5 4.8 3.9 7.4" />
  </svg>
);

export const RepeatOneIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6.5 4.8h9A4 4 0 0 1 19.5 8.8v6.4" />
    <path d="M17.5 19.2h-9A4 4 0 0 1 4.5 15.2V8.8" />
    <path d="m14.9 16.6 2.6 2.6 2.6-2.6M9.1 7.4 6.5 4.8 3.9 7.4" />
    <path d="M11.4 10.6 12.6 10v3.6" />
  </svg>
);

export const HeartIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 20.2s-7.6-4.4-9.1-9.2C1.7 7.4 3.9 4.4 7.1 4.4c2 0 3.6 1.1 4.4 2.7l.5.9.5-.9c.8-1.6 2.4-2.7 4.4-2.7 3.2 0 5.4 3 4.2 6.6-1.5 4.8-9.1 9.2-9.1 9.2Z" />
  </svg>
);

export const VolumeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 9.5h2.8L11 5.8v12.4L6.8 14.5H4z" />
    <path d="M14.6 9.2a4 4 0 0 1 0 5.6M17.2 6.6a7.6 7.6 0 0 1 0 10.8" />
  </svg>
);

export const VolumeMuteIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 9.5h2.8L11 5.8v12.4L6.8 14.5H4z" />
    <path d="m15 9.5 4.5 5M19.5 9.5 15 14.5" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="m15.6 15.6 4 4" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h11" />
  </svg>
);

export const QueueIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 6.5h11M3.5 11h11M3.5 15.5h7" />
    <path d="M17.5 10v7.2" />
    <circle cx="15.6" cy="18" r="1.9" />
    <path d="M17.5 10c1 .2 2 .8 2.6 1.7" />
  </svg>
);

export const DiscIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="2.4" />
    <path d="M12 3.6a8.4 8.4 0 0 1 8.4 8.4" opacity=".55" />
  </svg>
);

export const MicIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="9.2" y="2.8" width="5.6" height="10.4" rx="2.8" />
    <path d="M5.6 11.4a6.4 6.4 0 0 0 12.8 0M12 17.8v3.4M9 21.2h6" />
  </svg>
);

export const VideoIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2.8" y="5.4" width="12.6" height="13.2" rx="2.6" />
    <path d="m15.4 12 5.8-3.6v7.2L15.4 12Z" />
  </svg>
);

export const NewsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 5.2h12.4v13.6H5.6A1.6 1.6 0 0 1 4 17.2V5.2Z" />
    <path d="M16.4 9h3.6v8.2a1.6 1.6 0 0 1-3.2 0V9Z" />
    <path d="M6.8 8.4h6.8M6.8 11.4h6.8M6.8 14.4h4" />
  </svg>
);

export const CompassIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="m14.9 9.1-1.5 4.3-4.3 1.5 1.5-4.3 4.3-1.5Z" />
  </svg>
);

export const HomeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 10.6 12 4l8 6.6V19a1.4 1.4 0 0 1-1.4 1.4h-3.4v-5.6H8.8v5.6H5.4A1.4 1.4 0 0 1 4 19v-8.4Z" />
  </svg>
);

export const VerifiedIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" {...props}>
    <path d="m12 2.6 2.2 1.7 2.8-.2.9 2.7 2.4 1.5-.8 2.7.8 2.7-2.4 1.5-.9 2.7-2.8-.2L12 19.4l-2.2-1.7-2.8.2-.9-2.7L3.7 13.7l.8-2.7-.8-2.7 2.4-1.5.9-2.7 2.8.2L12 2.6Z" opacity=".35" />
    <path d="m8.4 12.2 2.4 2.4 4.8-5" stroke="#0f0b10" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const InstagramIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5" />
    <circle cx="12" cy="12" r="3.9" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const YoutubeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2.6" y="5.6" width="18.8" height="12.8" rx="4" />
    <path d="m10.4 9.4 4.6 2.6-4.6 2.6V9.4Z" fill="currentColor" stroke="none" />
  </svg>
);

export const TiktokIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14.2 3.2v10.9a3.4 3.4 0 1 1-3.4-3.4c.3 0 .6 0 .9.1" />
    <path d="M14.2 3.2c.4 2.4 2.1 4.1 4.6 4.4" />
  </svg>
);

export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4.5 12h14M13.4 6.6 18.8 12l-5.4 5.4" />
  </svg>
);

export const ArrowUpRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7 17 17 7M8.6 7H17v8.4" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const EditIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20h4l10.2-10.2a2.4 2.4 0 0 0 0-3.4l-.6-.6a2.4 2.4 0 0 0-3.4 0L4 16v4Z" />
    <path d="m14.4 6.6 3 3" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4.8 6.8h14.4M9.4 6.8V4.6h5.2v2.2M6.6 6.8l.9 12.2a1.6 1.6 0 0 0 1.6 1.4h5.8a1.6 1.6 0 0 0 1.6-1.4l.9-12.2" />
    <path d="M10.4 10.6v6M13.6 10.6v6" />
  </svg>
);

export const DashboardIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.6 13.4a8.6 8.6 0 0 1 16.8 0" />
    <path d="m12 13.6 3.6-3.4" />
    <path d="M3.6 17.8h16.8" />
    <circle cx="12" cy="13.6" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const LogoutIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14.6 4.6H6.8A2.2 2.2 0 0 0 4.6 6.8v10.4a2.2 2.2 0 0 0 2.2 2.2h7.8" />
    <path d="M16.4 8.6 19.8 12l-3.4 3.4M19.4 12h-8.6" />
  </svg>
);

export const EyeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2.6 12S6 5.9 12 5.9 21.4 12 21.4 12 18 18.1 12 18.1 2.6 12 2.6 12Z" />
    <circle cx="12" cy="12" r="2.9" />
  </svg>
);

export const ClockIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3.2 2" />
  </svg>
);

export const FlameIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 21c3.9 0 6.4-2.5 6.4-5.9 0-4.6-4.4-6.2-3.9-11.1-2.6 1-4.2 3.2-4.2 5.4 0 1.2.4 2 .4 2.6 0 .9-.7 1.5-1.5 1.5-1 0-1.7-.9-1.8-2.2C6 12.6 5.6 14 5.6 15.1 5.6 18.5 8.1 21 12 21Z" />
  </svg>
);

export const UserIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8.4" r="3.8" />
    <path d="M4.8 20.2c.6-3.6 3.6-5.8 7.2-5.8s6.6 2.2 7.2 5.8" />
  </svg>
);

export const WaveIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 12h2l2-6 2.4 14L12 5.4l2.2 12 1.8-6.6 1.4 3.2H21" />
  </svg>
);

export const SparkIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
    <path d="M12 2.6c.7 4.6 2.2 6.1 6.8 6.8-4.6.7-6.1 2.2-6.8 6.8-.7-4.6-2.2-6.1-6.8-6.8 4.6-.7 6.1-2.2 6.8-6.8Z" />
    <path d="M18.4 15.2c.4 2.3 1.1 3 3.4 3.4-2.3.4-3 1.1-3.4 3.4-.4-2.3-1.1-3-3.4-3.4 2.3-.4 3-1.1 3.4-3.4Z" opacity=".6" />
  </svg>
);

export const MapPinIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 21s6.6-5.4 6.6-10.2A6.6 6.6 0 0 0 5.4 10.8C5.4 15.6 12 21 12 21Z" />
    <circle cx="12" cy="10.6" r="2.4" />
  </svg>
);

/* ------------------------- Identité visuelle MGB -------------------------- */

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mgbGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFC53D" />
          <stop offset="45%" stopColor="#FF6A1A" />
          <stop offset="100%" stopColor="#12B877" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#mgbGrad)" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="#0f0b10" strokeOpacity=".25" strokeWidth="2" />
      <path
        d="M11 33V16.6c0-1 1.2-1.5 1.9-.8l5.6 5.6 4.6-6.1c.5-.7 1.6-.5 1.8.3l2.4 9.6 3.6-4.4c.6-.7 1.8-.3 1.8.6V33"
        fill="none"
        stroke="#160c10"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="3.1" fill="#160c10" opacity=".18" />
    </svg>
  );
}

export function EqualizerBars({ playing = false, className = "" }: { playing?: boolean; className?: string }) {
  const delays = ["0s", "0.18s", "0.36s", "0.12s"];
  const heights = ["60%", "100%", "75%", "45%"];
  return (
    <span className={`inline-flex h-4 items-end gap-[2px] ${className}`} aria-hidden="true">
      {delays.map((delay, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-current transition-all ${playing ? "eq-bar" : ""}`}
          style={{
            height: playing ? heights[i] : "22%",
            animationDelay: delay,
            animationPlayState: playing ? "running" : "paused",
          }}
        />
      ))}
    </span>
  );
}
