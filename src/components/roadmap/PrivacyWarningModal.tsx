import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Shield } from 'lucide-react';

interface PrivacyWarningModalProps {
  open: boolean;
  targetVisibility: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function PrivacyWarningModal({
  open,
  targetVisibility,
  onCancel,
  onConfirm,
}: PrivacyWarningModalProps) {
  const isMakingPublic = targetVisibility;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={onCancel}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border border-white/10
                       bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900
                       p-6 shadow-2xl"
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border ${
                  isMakingPublic
                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                    : 'border-zinc-500/40 bg-zinc-500/15 text-zinc-300'
                }`}
              >
                {isMakingPublic ? <AlertTriangle className="h-4.5 w-4.5" /> : <Shield className="h-4.5 w-4.5" />}
              </span>

              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">
                  {isMakingPublic ? 'Make Project Public?' : 'Make Project Private?'}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {isMakingPublic
                    ? 'This will expose your project in public areas and allow others to discover and comment on it.'
                    : 'This will hide your project from public areas and disable community visibility for this submission.'}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  You can change this setting again later.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300
                           hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors ${
                  isMakingPublic
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isMakingPublic ? 'Yes, Make Public' : 'Yes, Make Private'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
