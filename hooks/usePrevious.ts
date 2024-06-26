import { useEffect, useRef } from "react"

// debugging helper to see previous state
export const usePrevious = (value: any) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
