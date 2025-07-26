// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function QRSearchPage() {
//   const [token, setToken] = useState('');
//   const navigate = useNavigate();

//   function submit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!token.trim()) return;
//     navigate(`/qr/${token.trim()}`);
//   }

//   return (
//     <div className="flex flex-col items-center justify-center h-screen gap-6">
//       <h1 className="text-2xl font-semibold">Buscar mascota</h1>

//       <form onSubmit={submit} className="flex gap-2">
//         <input
//           className="input w-80"
//           placeholder="Token (UUID)…"
//           value={token}
//           onChange={e => setToken(e.target.value)}
//         />
//         <button className="btn btn-primary">Buscar</button>
//       </form>
//     </div>
//   );
// }
