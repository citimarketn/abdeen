"use client";

import { useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleLoginButton({
  clientId,
  onSuccess,
  onError,
}: {
  clientId: string;
  onSuccess: (idToken: string) => void;
  onError?: (msg: string) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId) return;
    if (window.google?.accounts?.id) {
      setLoaded(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => setLoaded(true);
    document.head.appendChild(s);
  }, [clientId]);

  useEffect(() => {
    if (!loaded || !ref.current || !clientId) return;
    try {
      ref.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp: { credential?: string }) => {
          if (resp.credential) onSuccess(resp.credential);
        },
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 300,
      });
    } catch (e) {
      onError?.("تعذر تحميل زر جوجل");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, clientId]);

  if (!clientId) return null;
  return <div ref={ref} className="mt-4 flex justify-center" />;
}
