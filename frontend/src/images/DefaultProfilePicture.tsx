import React from "react";

const DefaultProfilePicture = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="48"
      height="49"
      fill="none"
      viewBox="0 0 48 49"
    >
      <g filter="url(#filter0_d_511_513)" shapeRendering="crispEdges">
        <circle cx="24" cy="22.5" r="20" fill="url(#pattern0)"></circle>
        <circle
          cx="24"
          cy="22.5"
          r="19"
          stroke="#388883"
          strokeWidth="2"
        ></circle>
      </g>
      <defs>
        <filter
          id="filter0_d_511_513"
          width="48"
          height="48"
          x="0"
          y="0.5"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="2"></feOffset>
          <feGaussianBlur stdDeviation="2"></feGaussianBlur>
          <feComposite in2="hardAlpha" operator="out"></feComposite>
          <feColorMatrix values="0 0 0 0 0.219608 0 0 0 0 0.533333 0 0 0 0 0.513726 0 0 0 0.25 0"></feColorMatrix>
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_511_513"
          ></feBlend>
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_511_513"
            result="shape"
          ></feBlend>
        </filter>
        <pattern
          id="pattern0"
          width="1"
          height="1"
          patternContentUnits="objectBoundingBox"
        >
          <use
            transform="matrix(.0115 0 0 .0115 -.017 0)"
            xlinkHref="#image0_511_513"
          ></use>
        </pattern>
        <image
          id="image0_511_513"
          width="90"
          height="87"
          xlinkHref="data:image/png;base64,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"
        ></image>
      </defs>
    </svg>
  );
}

export default DefaultProfilePicture;