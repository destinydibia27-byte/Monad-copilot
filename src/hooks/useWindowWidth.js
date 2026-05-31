import { useState, useEffect } from "react";
import { MOBILE } from "../constants/theme";

export function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export function useIsMobile() {
  const width = useWindowWidth();
  return width <= MOBILE;
}
