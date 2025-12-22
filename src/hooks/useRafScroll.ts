import { useEffect, useRef } from "react";

const SCROLL_EVENT = "scroll";
const PASSIVE_EVENT_OPTIONS: AddEventListenerOptions = { passive: true };

export type RafScrollHandler = (scrollY: number) => void;

export function useRafScroll(handler: RafScrollHandler) {
  const rafIdRef = useRef<number | null>(null);
  const latestScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      latestScrollRef.current = window.scrollY;
      if (rafIdRef.current !== null) return;

      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        handler(latestScrollRef.current);
      });
    };

    handleScroll();
    window.addEventListener(SCROLL_EVENT, handleScroll, PASSIVE_EVENT_OPTIONS);

    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener(SCROLL_EVENT, handleScroll, PASSIVE_EVENT_OPTIONS);
    };
  }, [handler]);
}

export default useRafScroll;
