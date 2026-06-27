import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  primaryColor?: string; // Dark Graphite (solid)
  accentColor?: string;  // Industrial Orange (accent)
  invertColors?: boolean; // Option to flip colors for dark/light themes
  className?: string;
  forceSvgFallback?: boolean; // Force standard SVG logo rendering
}

/**
 * DODISA CONTAINERS - Symmetrical "DD" Corporate Logo / Custom Logo Manager
 * If a custom logo URL is uploaded in the administration settings, it will be automatically rendered here.
 * Otherwise, it displays our beautiful corporate industrial steel container SVG vector logo.
 */
export default function Logo({
  size = 48,
  primaryColor = "#FFFFFF", // White
  accentColor = "#FFD400",  // Premium Yellow
  invertColors = false,
  className,
  forceSvgFallback = false,
  ...props
}: LogoProps) {
  let context: any = null;
  try {
    context = useAppContext();
  } catch (err) {
    // Graceful fallback outside context
  }

  const logoSettings = context?.logoSettings;
  const logoUrl = logoSettings?.logoUrl;
  const logoDarkUrl = logoSettings?.logoDarkUrl;

  // Decide if we should render a custom image or fallback to built-in SVG
  const hasCustomLogo = !forceSvgFallback && logoSettings && (
    (invertColors && logoDarkUrl && logoDarkUrl !== "default") ||
    (!invertColors && logoUrl && logoUrl !== "default") ||
    (logoUrl && logoUrl !== "default")
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (hasCustomLogo) {
    const activeUrl = (invertColors && logoDarkUrl && logoDarkUrl !== "default") 
      ? logoDarkUrl 
      : (logoUrl && logoUrl !== "default" ? logoUrl : (logoDarkUrl || ""));

    const widthDesktop = logoSettings?.logoWidthDesktop || size * 3;
    const widthMobile = logoSettings?.logoWidthMobile || size * 2;
    const activeWidth = isMobile ? widthMobile : widthDesktop;
    const altText = logoSettings?.logoAlt || "Dodisa Containers Logo";

    return (
      <img
        src={activeUrl}
        alt={altText}
        className={`object-contain max-h-[85px] select-none transition-all duration-300 ${className || ""}`}
        style={{
          width: `${activeWidth}px`,
        }}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Standard SVG fallback
  const colorYellow = "#FFD400";
  const colorOrange = "#FF9A00";
  const colorDark = "#111827";

  let d1Color = colorYellow;
  let d2Color = colorOrange;

  if (invertColors) {
    d1Color = colorDark;
    d2Color = colorDark;
  } else if (primaryColor === "#FFFFFF" && accentColor === "#FFFFFF") {
    d1Color = "#FFFFFF";
    d2Color = "#FFFFFF";
  } else if (primaryColor === "none" || primaryColor === "currentColor") {
    d1Color = "currentColor";
    d2Color = "currentColor";
  } else {
    // Respect passed colors. If they match the main header style, use official yellow/orange
    d1Color = accentColor || colorYellow;
    d2Color = colorOrange;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`select-none ${className || ""}`}
      id="dodisa-corporate-logo"
      {...props}
    >
      {/* Solid fused double "D" monogram chevron block design exactly as in the user's reference image */}
      <path
        d="M 25 20 H 50 L 65 60 L 50 100 H 25 Z"
        fill={d1Color}
        id="left-d-solid-block"
      />
      <path
        d="M 55 20 H 80 L 95 60 L 80 100 H 55 L 70 60 Z"
        fill={d2Color}
        id="right-d-solid-block"
      />
    </svg>
  );
}
