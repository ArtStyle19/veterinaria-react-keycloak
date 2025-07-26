// src/components/ManageAccessModal.tsx
import { useEffect, useState } from 'react';
import {
  getRecordsClinicAccess,
  updateRecordClinicAccess,
  type UpdateAccessLevelBody,
} from '../api/record';

interface Props {
  recordId: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void; // p/ refrescar padre
}

export default function ManageAccessModal({
  recordId,
  isOpen,
  onClose,
  onSaved,
}: Props) {
  const [accesses, setAccesses] = useState<UpdateAccessLevelBody[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getRecordsClinicAccess(recordId).then(setAccesses);
  }, [isOpen, recordId]);

  const handleLevelChange = (
    clinicId: number,
    level: UpdateAccessLevelBody['accessLevel'],
  ) => {
    setAccesses((prev) =>
      prev.map((c) =>
        c.clinicId === clinicId ? { ...c, accessLevel: level } : c,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // --> solo envía los que hayan cambiado
      const promises = accesses.map((a) =>
        updateRecordClinicAccess(recordId, a),
      );
      await Promise.all(promises);
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg p-6 bg-black/10 rounded-xl space-y-6 animate-fade-in">
        <h2 className="text-xl font-semibold">
          Accesos al registro #{recordId}
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Clínica</th>
              <th className="py-2 text-center">Nivel</th>
            </tr>
          </thead>
          <tbody>
            {accesses.map((c) => (
              <tr key={c.clinicId} className="border-b">
                <td className="py-2">{c.clinicName}</td>
                <td className="py-2 text-center">
                  <select
                    value={c.accessLevel}
                    onChange={(e) =>
                      handleLevelChange(
                        c.clinicId,
                        e.target.value as UpdateAccessLevelBody['accessLevel'],
                      )
                    }
                    className="select select-sm select-bordered"
                  >
                    <option value="NONE">Sin acceso</option>
                    <option value="READ">Solo lectura</option>
                    <option value="WRITE">Lectura y Escritura</option>
                    <option value="FULL">Total</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end gap-3">
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
