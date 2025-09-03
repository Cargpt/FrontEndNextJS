"use client";

import { useColorMode } from "@/Context/ColorModeContext";
import React from "react";

type BrandNameProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renders the brand name "AiCarAdvisor" with a small superscript TM in a circle.
 * Use this component anywhere the brand is displayed in UI text.
 */
const BrandName: React.FC<BrandNameProps> = ({ className, style }) => {
  const {mode} = useColorMode()

  return (
    <span className={className} style={{top:115}}>
AiCarAdvisor
      <sup
        style={{
          fontSize: "0.35em",
          lineHeight: 1,
          verticalAlign: "super",
          marginLeft: 2,
          position: "relative",
          top:4,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "15px",
          height: "15px",
          borderRadius: "50%",
          color: mode=="dark" ? "white" : "#333",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          border: "2px solid " + (mode=="dark" ? "white" : "#333"),
        }}
        aria-hidden="true"
      >
<span style={{marginTop:10, fontSize:"18px"}}>        &#8482;</span>
      </sup>
    </span>
  );
};

export default BrandName;


