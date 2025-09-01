"use client";

import React from "react";

type BrandNameProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renders the brand name "AiCarAdvisor" with a small superscript TM.
 * Use this component anywhere the brand is displayed in UI text.
 */
const BrandName: React.FC<BrandNameProps> = ({ className, style }) => {
  return (
    <span className={className} style={style}>
      AiCarAdvisor
      <sup
        style={{
          fontSize: "0.5em",
          lineHeight: 1,
          verticalAlign: "super",
          marginLeft: 2,
          position: "relative",
          top: -1,
        }}
        aria-hidden="true"
      >
        (TM)
      </sup>
    </span>
  );
};

export default BrandName;


