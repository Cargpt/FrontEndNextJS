"use client";

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
  return (
    <span className={className} style={style}>
      AiCarAdvisor
      <sup
        style={{
          fontSize: "0.35em",
          lineHeight: 1,
          verticalAlign: "super",
          marginLeft: 4,
          position: "relative",
          top: -2,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1.2em",
          height: "1.2em",
          borderRadius: "50%",
          backgroundColor: "currentColor",
          color: "white",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
        aria-hidden="true"
      >
        TM
      </sup>
    </span>
  );
};

export default BrandName;


