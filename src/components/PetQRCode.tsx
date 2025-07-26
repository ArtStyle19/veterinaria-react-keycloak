import { QRCodeSVG } from 'qrcode.react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  token?: string;
  size?: number;
}

export default function PetQRCode({ token, size = 160, ...props }: Props) {
  const url = `${import.meta.env.VITE_PUBLIC_BASE_URL}/qr/${token}`;
  return (
    <div className="flex flex-col items-center gap-2" {...props}>
      <QRCodeSVG value={url} size={size} level="M" />
    </div>
  );
}
