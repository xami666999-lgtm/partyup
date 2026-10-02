type Props = { id: string; title?: string };

const ALIAS: Record<string, string> = {
  ms: 'mastersystem',
  md: 'megadrive',
  gg: 'gamegear',
  gb: 'gameboy',
  dc: 'dreamcast',
};

export function ConsoleLogo({ id, title }: Props) {
  const key = ALIAS[id] || id;
  return (
    <svg className={`console-logo logo-${key}`} viewBox="0 0 220 72" role="img" aria-label={title || key}>
      {mark(key)}
    </svg>
  );
}

function mark(id: string) {
  switch (id) {
    case 'nes':
      return (
        <>
          <rect x="18" y="10" width="184" height="52" rx="16" fill="#111" stroke="#e10600" strokeWidth="5" />
          <text x="110" y="46" textAnchor="middle" fill="#fff" fontFamily="Impact, sans-serif" fontSize="32" letterSpacing="2">NES</text>
        </>
      );
    case 'snes':
      return (
        <>
          <rect x="16" y="14" width="14" height="44" fill="#e23b3b" />
          <rect x="32" y="14" width="14" height="44" fill="#f0c418" />
          <rect x="48" y="14" width="14" height="44" fill="#3aa0ff" />
          <rect x="64" y="14" width="14" height="44" fill="#22a85a" />
          <text x="88" y="34" fill="#fff" fontFamily="Arial Black, sans-serif" fontSize="15">SUPER</text>
          <text x="88" y="54" fill="#fff" fontFamily="Arial Black, sans-serif" fontSize="16">NINTENDO</text>
        </>
      );
    case 'gameboy':
      return (
        <>
          <rect x="28" y="14" width="164" height="44" rx="22" fill="#8bac0f" />
          <text x="110" y="43" textAnchor="middle" fill="#0f380f" fontFamily="Arial Black, sans-serif" fontSize="18">GAME BOY</text>
        </>
      );
    case 'gba':
      return (
        <>
          <rect x="22" y="16" width="176" height="40" rx="8" fill="#6b2d8b" />
          <text x="110" y="43" textAnchor="middle" fill="#fff" fontFamily="Arial Black, sans-serif" fontSize="20">GBA</text>
        </>
      );
    case 'n64':
      return (
        <>
          <text x="18" y="50" fill="#fff" fontFamily="Arial Black, sans-serif" fontSize="28">NINTENDO</text>
          <text x="168" y="50" fill="#e10600" fontFamily="Arial Black, sans-serif" fontSize="28">64</text>
        </>
      );
    case 'gc':
      return (
        <>
          <circle cx="40" cy="36" r="18" fill="#111" stroke="#fff" strokeWidth="3" />
          <circle cx="40" cy="36" r="6" fill="#6a4cff" />
          <text x="68" y="44" fill="#fff" fontFamily="Arial Black, sans-serif" fontSize="20">GAMECUBE</text>
        </>
      );
    case 'wii':
      return (
        <>
          <text x="70" y="48" fill="#fff" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="300" letterSpacing="6">Wii</text>
        </>
      );
    case 'nds':
      return (
        <>
          <rect x="24" y="12" width="36" height="48" rx="4" fill="#c8c8c8" />
          <rect x="64" y="12" width="36" height="48" rx="4" fill="#e8e8e8" />
          <text x="112" y="44" fill="#fff" fontFamily="Arial Black, sans-serif" fontSize="18">NINTENDO DS</text>
        </>
      );
    case 'mastersystem':
      return (
        <>
          <text x="16" y="32" fill="#3aa0ff" fontFamily="Arial Black, sans-serif" fontSize="16">SEGA</text>
          <text x="16" y="56" fill="#fff" fontFamily="Arial Black, sans-serif" fontSize="20">MASTER SYSTEM</text>
        </>
      );
    case 'megadrive':
      return (
        <>
          <text x="18" y="30" fill="#1d4e9e" fontFamily="Arial Black, sans-serif" fontSize="18">SEGA</text>
          <text x="18" y="56" fill="#e10600" fontFamily="Arial Black, sans-serif" fontSize="22">MEGA DRIVE</text>
        </>
      );
    case 'gamegear':
      return (
        <>
          <rect x="30" y="12" width="160" height="48" rx="10" fill="#111" stroke="#f0c418" strokeWidth="3" />
          <text x="110" y="43" textAnchor="middle" fill="#f0c418" fontFamily="Arial Black, sans-serif" fontSize="18">GAME GEAR</text>
        </>
      );
    case 'saturn':
      return (
        <>
          <circle cx="36" cy="36" r="16" fill="none" stroke="#fff" strokeWidth="3" />
          <circle cx="36" cy="36" r="5" fill="#e10600" />
          <text x="62" y="44" fill="#fff" fontFamily="Arial Black, sans-serif" fontSize="22">SATURN</text>
        </>
      );
    case 'dreamcast':
      return (
        <>
          <circle cx="36" cy="36" r="16" fill="#ff4b2b" />
          <circle cx="36" cy="36" r="6" fill="#fff" />
          <text x="62" y="44" fill="#fff" fontFamily="Arial, sans-serif" fontSize="20">DREAMCAST</text>
        </>
      );
    case 'psx':
    case 'ps2':
    case 'ps3':
    case 'psp':
    case 'ps5':
      return <PlayStation id={id} />;
    case 'xbox':
    case 'xbox360':
      return <Xbox id={id} />;
    case 'arcade':
      return (
        <text x="110" y="46" textAnchor="middle" fill="#f0c418" fontFamily="Arial Black, sans-serif" fontSize="26">ARCADE</text>
      );
    default:
      return (
        <text x="110" y="44" textAnchor="middle" fill="#fff" fontFamily="Arial Black, sans-serif" fontSize="22">{id.toUpperCase()}</text>
      );
  }
}

function PlayStation({ id }: { id: string }) {
  const label = id === 'psx' ? 'PS' : id === 'psp' ? 'PSP' : id.toUpperCase();
  return (
    <>
      <polygon points="28,14 40,34 16,34" fill="#5bc0eb" />
      <circle cx="62" cy="24" r="9" fill="none" stroke="#e23b3b" strokeWidth="3" />
      <path d="M84 16c8 8 8 18 0 26" fill="none" stroke="#c26bff" strokeWidth="3" />
      <path d="M96 40l8-22h8l-12 28h-8z" fill="#7dffb3" />
      <text x="118" y="46" fill="#fff" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="700">{label}</text>
    </>
  );
}

function Xbox({ id }: { id: string }) {
  return (
    <>
      <circle cx="36" cy="36" r="18" fill="none" stroke="#8dc63f" strokeWidth="4" />
      <circle cx="36" cy="36" r="7" fill="#8dc63f" />
      <text x="64" y="44" fill="#fff" fontFamily="Arial Black, sans-serif" fontSize="20">{id === 'xbox360' ? 'XBOX 360' : 'XBOX'}</text>
    </>
  );
}
