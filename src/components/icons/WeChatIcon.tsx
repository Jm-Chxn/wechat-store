import * as React from "react";

interface WeChatIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * WeChat logo SVG icon.
 * The two speech-bubble silhouettes are the universally recognised WeChat symbol.
 */
export function WeChatIcon({ size = 20, className, ...props }: WeChatIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Large bubble (WeChat users) */}
      <path d="M9.5 2C5.358 2 2 5.02 2 8.75c0 1.914.87 3.638 2.258 4.888L3.5 16l2.916-1.458A8.16 8.16 0 0 0 9.5 15.5c.34 0 .676-.018 1.007-.053-.138-.43-.212-.884-.212-1.353C10.295 10.71 13.3 8 17 8c.358 0 .71.025 1.055.073C17.322 4.6 13.78 2 9.5 2Z" />
      {/* Small bubble (WeChat business/official) */}
      <path d="M17 9.5c-3.038 0-5.5 2.14-5.5 4.781 0 1.332.617 2.527 1.6 3.38l-.6 1.839 2.168-1.084c.724.214 1.498.334 2.332.334 3.038 0 5.5-2.14 5.5-4.781C22.5 11.64 20.038 9.5 17 9.5Zm-2.5 2.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm2.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm2.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" />
    </svg>
  );
}
