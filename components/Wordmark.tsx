import Image from 'next/image';

export function Wordmark({ small = false }: { small?: boolean }) {
  const size = small ? 28 : 36;
  return (
    <div className={`flex items-center ${small ? '' : 'py-1'}`}>
      <Image
        src="/Logo_Apartner.svg"
        alt="Apartner"
        width={140}
        height={size}
        priority
        style={{ height: size, width: 'auto', display: 'block' }}
      />
    </div>
  );
}
