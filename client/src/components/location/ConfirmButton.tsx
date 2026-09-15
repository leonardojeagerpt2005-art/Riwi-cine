import { CheckCircle2 } from "lucide-react";

interface ConfirmButtonProps {
  disabled: boolean;
  onConfirm: () => void;
}

export function ConfirmButton({ disabled, onConfirm }: ConfirmButtonProps) {
  return (
    <button
      type="button"
      onClick={onConfirm}
      disabled={disabled}
      className="water-btn w-full py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
      <span>Confirmar ubicación</span>
    </button>
  );
}
