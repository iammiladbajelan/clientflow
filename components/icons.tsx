import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const IconGrid = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
    <circle cx="9.5" cy="7" r="3.2" />
    <path d="M17 11.2a3 3 0 1 0-2-5.4" />
    <path d="M21 19v-.8a3.6 3.6 0 0 0-2.6-3.3" />
  </svg>
);

export const IconFolder = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2.5h7A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-10Z" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconCheckCircle = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
);

export const IconList = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconWallet = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M3 7a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 19 7v1" />
    <rect x="3" y="8" width="18" height="11" rx="2.5" />
    <circle cx="16.5" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconAlert = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M12 4 2.8 20h18.4L12 4Z" />
    <path d="M12 10v4M12 17.2v.1" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.8-3.8" />
  </svg>
);

export const IconSun = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const IconMoon = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
  </svg>
);

export const IconGlobe = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.7 2.6 4 5.7 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.7-4-9s1.3-6.4 4-9Z" />
  </svg>
);

export const IconLogout = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M10 8.5 6.5 12l3.5 3.5" />
    <path d="M6.5 12H16" />
  </svg>
);

export const IconSettings = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.08a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconEdit = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="M13.5 6.5l3 3" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    <path d="M6.5 7 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9L17.5 7" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const IconMail = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M5 4h4l1.5 4.5-2.2 1.6a12.5 12.5 0 0 0 5.6 5.6l1.6-2.2L20 15v4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
  </svg>
);

export const IconCalendar = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 10.5h17" />
  </svg>
);

export const IconEye = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M4 4l16 16" />
    <path d="M10.6 6a9.8 9.8 0 0 1 1.4-.1c6 0 9.5 6.1 9.5 6.1a17.2 17.2 0 0 1-2.5 3.3" />
    <path d="M6.6 6.9A16.4 16.4 0 0 0 2.5 12S6 18.1 12 18.1a9 9 0 0 0 4.3-1.1" />
    <path d="M9.9 10.1a3 3 0 0 0 4.1 4.3" />
  </svg>
);

export const IconTrend = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M3 17l6-6 4 4 7.5-7.5" />
    <path d="M14.5 7.5H21V14" />
  </svg>
);

export const IconInbox = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M3 13.5 5.6 5.6A2 2 0 0 1 7.5 4h9a2 2 0 0 1 1.9 1.6L21 13.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.5Z" />
    <path d="M3 13.5h5l1.2 2.2h5.6L16 13.5h5" />
  </svg>
);

export const IconMonitor = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <rect x="3" y="4" width="18" height="12.5" rx="2" />
    <path d="M9 20.5h6M12 16.5v4" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconChevronDown = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconDollar = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M12 2.5v19" />
    <path d="M17 6.5c-.8-1.3-2.6-2-5-2-2.8 0-4.5 1.2-4.5 3.2 0 4.3 9.8 2 9.8 6.6 0 2-1.9 3.2-5.3 3.2-2.5 0-4.4-.8-5.2-2.2" />
  </svg>
);

export const IconInvoice = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M6 3.5h12v17l-2.5-1.5-2.5 1.5-2.5-1.5L8 20.5l-2-1.5v-15.5Z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 7.9 7 9.5 4.1-1.6 7-5.2 7-9.5V6l-7-3Z" />
    <path d="m9 11.5 2.2 2.2L15.5 9.4" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg {...base} fill="currentColor" stroke="none" width="1em" height="1em" {...p}>
    <path d="M12 2.8l2.6 5.4 5.9.9-4.3 4.2 1 5.9L12 16.4l-5.2 2.8 1-5.9L3.5 9.1l5.9-.9L12 2.8Z" />
  </svg>
);

export const IconPlay = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPause = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <rect x="6.5" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
    <rect x="13.9" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconShare = (p: P) => (
  <svg {...base} width="1em" height="1em" {...p}>
    <circle cx="18" cy="5.5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="18.5" r="2.5" />
    <path d="M8.2 10.8l7.5-4.2M8.2 13.2l7.5 4.2" />
  </svg>
);
