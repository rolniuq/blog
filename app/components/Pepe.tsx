function Pepe({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="21.5" cy="20" r="8.5" fill="#6f9440" />
      <circle cx="42.5" cy="20" r="8.5" fill="#6f9440" />
      <path
        d="M12.5 31 C12.5 22.5 20 19.5 32 19.5 C44 19.5 51.5 22.5 51.5 31 C51.5 43 44 50.5 32 50.5 C20 50.5 12.5 43 12.5 31 Z"
        fill="#6f9440"
      />
      <circle cx="21.5" cy="18.5" r="5.4" fill="#f7f3e6" />
      <circle cx="42.5" cy="18.5" r="5.4" fill="#f7f3e6" />
      <circle cx="23.6" cy="19.6" r="2.4" fill="#141414" />
      <circle cx="44.6" cy="19.6" r="2.4" fill="#141414" />
      <ellipse cx="28" cy="30.5" rx="1.3" ry="1" fill="#3d5720" />
      <ellipse cx="36" cy="30.5" rx="1.3" ry="1" fill="#3d5720" />
      <path
        d="M14.5 37.5 Q32 43.5 49.5 37.5 Q48.5 46.5 32 48.5 Q15.5 46.5 14.5 37.5 Z"
        fill="#567a2e"
      />
      <path
        d="M17 39.5 Q32 45 47 39.5"
        stroke="#2c4016"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Pepe;
