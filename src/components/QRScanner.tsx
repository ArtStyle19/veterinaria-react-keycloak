// import { Html5QrcodeScanner } from 'html5-qrcode';
// import { useEffect, useRef } from 'react';

// interface Props {
//   onResult: (value: string) => void;
// }

// function isMobileDevice(): boolean {
//   return /Mobi|Android|iPhone/i.test(navigator.userAgent);
// }

// export default function QRScanner({ onResult }: Props) {
//   const scannerRef = useRef<Html5QrcodeScanner | null>(null);

//   useEffect(() => {
//     const scannerDiv = document.getElementById('qr-reader');
//     if (!scannerDiv) return;

//     const width = isMobileDevice() ? window.innerWidth * 0.9 : 250;
//     const qrboxSize = width * 1;

//     const scanner = new Html5QrcodeScanner(
//       'qr-reader',
//       {
//         fps: 1,
//         qrbox: { width: qrboxSize, height: qrboxSize },
//         rememberLastUsedCamera: false,
//         // aspectRatio: 100.0,
//         // showTorchButtonIfSupported: true,
//         showTorchButtonIfSupported: true,
//         showZoomSliderIfSupported: true,
//         defaultZoomValueIfSupported: 1,
//         aspectRatio: 1.0,
//         disableFlip: false,
//         // videoConstraints: {
//         //   facingMode: 'environment',
//         //   width: { ideal: 640 },
//         //   height: { ideal: 480 }
//         // }
//       },
//       false,
//     );

//     const observer = new MutationObserver(() => {
//       const shadedRegion = document.querySelector(
//         '#qr-shaded-region',
//       ) as HTMLElement;
//       if (shadedRegion && !shadedRegion.querySelector('.qr-scan-line')) {
//         const line = document.createElement('div');
//         line.className = 'qr-scan-line';
//         shadedRegion.appendChild(line);
//         observer.disconnect(); // ya no se necesita observar más
//       }
//     });

//     observer.observe(document.getElementById('qr-reader')!, {
//       childList: true,
//       subtree: true,
//     });

//     scanner.render(
//       (decodedText) => {
//         scanner
//           .clear()
//           .then(() => {
//             onResult(decodedText);
//           })
//           .catch(console.error);
//       },
//       (error) => {
//         // Silenciar errores comunes como NotFound
//         // if (error.name !== 'NotFoundException') {
//         console.warn('Scan error:', error);
//         // }
//       },
//     );

//     scannerRef.current = scanner;

//     return () => {
//       scanner.clear().catch(() => {});
//     };
//   }, []);

//   return (
//     <div className="flex justify-center">
//       <div
//         id="qr-reader"
//         className="rounded shadow"
//         style={{
//           width: isMobileDevice() ? '100%' : '1000px',
//           maxWidth: '100%',
//         }}
//       />
//     </div>
//   );
// }
