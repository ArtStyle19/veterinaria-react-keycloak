// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import QRScanner from '../../components/QRScanner';

// // export default function QrPetSearchPage() {
// //   const [manual, setManual] = useState('');
// //   const [showScanner, setShowScanner] = useState(false);
// //   const [error, setError] = useState('');
// //   const navigate = useNavigate();

// //   const goToPet = (token: string) => {
// //     if (!token || token.length < 10) {
// //       setError('Token inválido. Asegúrate de escanear un código válido.');
// //       return;
// //     }
// //     setError('');
// //     navigate(`/qr/${token}`);
// //   };

// //   return (
// //     <div className="max-w-lg mx-auto space-y-6">
// //       <h1 className="text-2xl font-semibold text-center">Buscar Mascota</h1>

// //       <div className="text-center">
// //         <button
// //           onClick={() => {
// //             setShowScanner((prev) => !prev);
// //             setError('');
// //           }}
// //           className="btn btn-primary w-full"
// //         >
// //           {showScanner ? 'Usar modo manual' : 'Escanear QR con cámara'}
// //         </button>
// //       </div>

// //       {showScanner ? (
// //         <QRScanner onResult={goToPet} />
// //       ) : (
// //         <form
// //           onSubmit={(e) => {
// //             e.preventDefault();
// //             goToPet(manual.trim());
// //           }}
// //           className="space-y-4"
// //         >
// //           <input
// //             placeholder="Token (UUID)…"
// //             value={manual}
// //             onChange={(e) => setManual(e.target.value)}
// //             className="input w-full"
// //           />
// //           <button className="btn btn-primary w-full">Buscar</button>
// //           {error && <p className="text-red-600 text-sm">{error}</p>}
// //         </form>
// //       )}
// //     </div>
// //   );
// // }

// // src/pages/Visitor/QrPetSearchPage.tsx
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import QRScanner from '../../components/QRScanner';

// export default function QrPetSearchPage() {
//   const [manual, setManual] = useState('');
//   const [showScanner, setShowScanner] = useState(false);
//   const navigate = useNavigate();

//   const extractTokenFromQR = (input: string): string | null => {
//     const uuidRegex =
//       /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
//     const match = input.match(uuidRegex);
//     return match ? match[1] : null;
//   };

//   const goToPet = (raw: string) => {
//     const token = extractTokenFromQR(raw);
//     if (!token) {
//       alert('QR inválido. No se detectó ningún identificador válido.');
//       return;
//     }
// //visit should replace the modal with the pet information (this page have to be available to the other users too)
//     navigate(`/qr/${token}`);
//     // vet should replace the modal with the pet information but with import the pet camcel button;
//     // vet should replace the modal with the pet information but with import the pet camcel button;

//   };

//   return (
//     //modal

//         <div className="max-w-lg space-y-6 mx-auto bg-emerald-950/50 p-6 rounded shadow">

//     {/* <div className="max-w-lg mx-auto space-y-6"> */}
//       <h1 className="text-2xl font-semibold text-center">Buscar Mascota</h1>

//       <button
//         onClick={() => setShowScanner(prev => !prev)}
//         className="btn btn-primary w-full"
//       >
//         {showScanner ? 'Usar modo manual' : 'Escanear QR con cámara'}
//       </button>

//       {showScanner ? (
//         <QRScanner onResult={goToPet} />
//       ) : (
//         <form
//           onSubmit={e => {
//             e.preventDefault();
//             goToPet(manual.trim());
//           }}
//           className="space-y-4"
//         >
//           <input
//             placeholder="Token (UUID)…"
//             value={manual}
//             onChange={e => setManual(e.target.value)}
//             className="input w-full"
//           />
//           <button className="btn btn-primary w-full">Buscar</button>
//         </form>
//       )}
//     </div>
//   );
// }

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import QRScanner from '../../components/QRScanner';

// export default function QrPetSearchPage() {
//   const [manual, setManual] = useState('');
//   const [showScanner, setShowScanner] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const goToPet = (token: string) => {
//     if (!token || token.length < 10) {
//       setError('Token inválido. Asegúrate de escanear un código válido.');
//       return;
//     }
//     setError('');
//     navigate(`/qr/${token}`);
//   };

//   return (
//     <div className="max-w-lg mx-auto space-y-6">
//       <h1 className="text-2xl font-semibold text-center">Buscar Mascota</h1>

//       <div className="text-center">
//         <button
//           onClick={() => {
//             setShowScanner((prev) => !prev);
//             setError('');
//           }}
//           className="btn btn-primary w-full"
//         >
//           {showScanner ? 'Usar modo manual' : 'Escanear QR con cámara'}
//         </button>
//       </div>

//       {showScanner ? (
//         <QRScanner onResult={goToPet} />
//       ) : (
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             goToPet(manual.trim());
//           }}
//           className="space-y-4"
//         >
//           <input
//             placeholder="Token (UUID)…"
//             value={manual}
//             onChange={(e) => setManual(e.target.value)}
//             className="input w-full"
//           />
//           <button className="btn btn-primary w-full">Buscar</button>
//           {error && <p className="text-red-600 text-sm">{error}</p>}
//         </form>
//       )}
//     </div>
//   );
// }

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import QRScanner from '../../components/QRScanner';
import { useQrModal } from '../../qr-modal/QrModalContext';
import PageWrapper from '../../components/PageWrapper';

export default function QrPetSearchPage() {
  const [manual, setManual] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { open } = useQrModal();

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center gap-6 h-full">
        {/* <div className="flex flex-col items-center justify-center h-screen gap-6"> */}
        <h1 className="text-3xl font-bold">Scanea el QR de tu Mascota</h1>
        <p className="text-slate-600 text-center max-w-md">
          Bienvenido. Aquí puedes buscar la información pública de una mascota
          mediante su código QR o token.
        </p>

        <button className="btn btn-primary" onClick={() => open('VIEW')}>
          Scannear QR
        </button>

        {/* <Link to="/login" className="text-slate-600 hover:underline">
        Soy usuario registrado →
      </Link> */}
      </div>
    </PageWrapper>
  );
}
