import * as React from "react"
const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={800}
    height={800}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeWidth={2}
      d="M20.5 15c-1.544 3.045-4.738 6-8.5 6-4.852 0-8.415-3.49-9-8M3.5 9C4.891 5.65 8.065 3 12 3c4.782 0 8.423 3.49 9 8"
    />
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21v-5.4a.6.6 0 0 0-.6-.6v0H15M9 9H3.6v0a.6.6 0 0 1-.6-.6V3"
    />
  </svg>
)
export default SvgComponent
