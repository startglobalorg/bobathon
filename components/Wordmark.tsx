import Image from 'next/image';

// Source SVG aspect ratio: 1408 / 768 ≈ 1.83
const ASPECT = 1408 / 768;

export function Wordmark({ small = false }: { small?: boolean }) {
  const height = small ? 44 : 72;
  const width = Math.round(height * ASPECT);
  return (
    <div className="flex items-center" aria-label="Apartner">
      <Image
        src="/apartner_logo_v2.svg"
        alt="Apartner"
        width={width}
        height={height}
        priority
        style={{ height, width: 'auto', display: 'block' }}
      />
    </div>
  );
}
