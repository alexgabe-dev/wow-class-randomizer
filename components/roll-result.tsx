"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { classes, iconPath, type Role } from "@/lib/classes";

type Result = { id: string; name: string; line: string; roles: Role[] };

function ResultDetails({
  result,
  titleId,
}: {
  result: Result;
  titleId?: string;
}) {
  return (
    <>
      <p className="eyebrow" id={titleId}>
        Itt a classod
      </p>
      <div className="result-class">
        <img src={iconPath(result.name)} alt="" width={62} height={62} />
        <div>
          <h2
            style={{
              color: classes.find((c) => c.name === result.name)!.color,
            }}
          >
            {result.name}
          </h2>
          <p>{result.roles.join(" · ")}</p>
        </div>
      </div>
      <p className="result-line">„{result.line}”</p>
    </>
  );
}

export function RollResult({
  result,
  returnFocusRef,
}: {
  result: Result | null;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const mobile = useIsMobile();
  const dialog = useRef<HTMLDialogElement>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const showDialog = mobile && result !== null && dismissed !== result.id;

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (showDialog && !node.open) node.showModal();
    else if (!showDialog && node.open) node.close();
  }, [showDialog]);

  useEffect(() => {
    if (!showDialog) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showDialog]);

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true">
        {!mobile && result && (
          <section className="result" aria-label="A sorsolás eredménye">
            <ResultDetails result={result} />
          </section>
        )}
      </div>
      <dialog
        ref={dialog}
        className="result-dialog"
        aria-labelledby="mobile-result-title"
        onClose={() => {
          if (result) setDismissed(result.id);
          returnFocusRef.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            event.currentTarget.close();
        }}
      >
        {mobile && result && (
          <>
            <button
              className="result-dialog-close"
              type="button"
              aria-label="Bezárás"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
            <ResultDetails result={result} titleId="mobile-result-title" />
            <button
              className="result-dialog-confirm"
              type="button"
              onClick={() => dialog.current?.close()}
            >
              Rendben
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
