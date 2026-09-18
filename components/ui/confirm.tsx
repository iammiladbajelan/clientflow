"use client";

import { createContext, useContext, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/field";
import { useLocale } from "@/contexts/locale-context";

interface ConfirmState {
  message: string;
  danger?: boolean;
  resolve: (ok: boolean) => void;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);
  const { t } = useLocale();

  function confirm(message: string, danger = true) {
    return new Promise<boolean>((resolve) => {
      setState({ message, danger, resolve });
    });
  }

  function settle(ok: boolean) {
    state?.resolve(ok);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal open={!!state} onClose={() => settle(false)} title={t("confirm")}>
        <p className="text-sm leading-6 text-slate-300">
          {state?.message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => settle(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant={state?.danger ? "danger" : "primary"}
            onClick={() => settle(true)}
          >
            {t("confirm")}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

const ConfirmContext = createContext<{
  confirm: (message: string, danger?: boolean) => Promise<boolean>;
} | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}

