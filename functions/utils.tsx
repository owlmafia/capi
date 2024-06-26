import { FrError, QuantityChangeJs } from "wasm/wasm"
import { Notification } from "../components/Notification"
import { Wasm } from "../context/AppContext"
import arrowDown from "../images/svg/arrow.svg"
import arrowUp from "../images/svg/green-arrow.svg"
import { isFrError, toDefaultErrorMsg } from "./errors"

export const toBytesForRust = (bytes?: ArrayBuffer): number[] | null => {
  if (bytes && bytes.byteLength > 0) {
    const typedArray = new Uint8Array(bytes)
    return [...typedArray]
  } else {
    // in rust we often (always?) consider empty byte arrays invalid: it's has to be either "not set" or "set to something"
    // while here in js we e.g. initialize the image, files hooks to empty array for simpler handling
    // so we've to map empty array to null when passing to rust
    return null
  }
}

export const toBytes = (str: string): Uint8Array => {
  let utf8Encode = new TextEncoder()
  return utf8Encode.encode(str)
}

export const checkForUpdates = async (
  wasm: Wasm,
  notification: Notification,
  daoId: string,
  setVersionData: (data: any) => void
) => {
  safe(notification, async () => {
    let versionData = await wasm.checkForUpdates({ dao_id: daoId })

    if (versionData) {
      setVersionData(versionData)
    }
  })
}

export const pieChartColors = (): string[] => {
  return [
    "#273088",
    "#333eaf",
    "#4c56c7",
    "#737dd4",
    "#9ba2df",
    "#c3c7ec",
    "#ebecf8",
  ]
}

export const PIE_CHART_GRAY = "#EBECF1"

export const logUnexpected = (
  notification: Notification,
  consoleMsg: string
) => {
  console.error(consoleMsg)
  notification.error("Unexpected error. Please contact support.")
}

export const changeArrow = (change: QuantityChangeJs): JSX.Element | null => {
  switch (change) {
    case "Up":
      return (
        <div className="arrow-container">
          <img src={arrowUp.src} alt="arrow up" />
        </div>
      )
    case "Down":
      return (
        <div className="arrow-container">
          <img src={arrowDown.src} alt="arrow down" />
        </div>
      )
    case "Eq":
      return null
  }
}

export const shortedAddress = (address: string) => {
  console.log("shortening address: " + address)

  const short_chars = 3
  const leading = address.substring(0, short_chars)
  const trailing = address.substring(address.length - short_chars)
  return leading + "..." + trailing
}

// Executes code in try catch and shows an error notification if it fails
export const safe = async (
  notification: Notification,
  f: () => Promise<void>
) => {
  try {
    await f()
  } catch (e) {
    showError(notification, e)
  }
}

// Maps error to error msg and shows it in a notification
export const showError = (notification: Notification, error: any) => {
  const errorMsg = isFrError(error)
    ? toDefaultErrorMsg(error)
    : jsErrorToErrorMsg(error)
  notification.error(errorMsg)
}

// Maps arbitrary errors triggered in js/ts (opposed to wasm) to error messages
// TODO improve implementation
const jsErrorToErrorMsg = (jsError: any): string => {
  return jsError as string
}

export const uniqueTextId = (str: string): string => {
  return (hash(str).toString() + Math.random()).replaceAll(".", "")
}

export const hash = (str: string): number => {
  var hash = 0
  var i = 0
  var chr = null

  if (str.length === 0) return hash
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}
