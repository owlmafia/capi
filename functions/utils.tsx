import { FrError, QuantityChangeJs } from "wasm/wasm"
import { Notification } from "../components/Notification"
import { Wasm } from "../context/AppContext"
import arrowDown from "../images/svg/arrow.svg"
import arrowUp from "../images/svg/green-arrow.svg"
import { toDefaultErrorMsg } from "./errors"

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
  try {
    let versionData = await wasm.checkForUpdates({ dao_id: daoId })

    if (versionData) {
      setVersionData(versionData)
    }
  } catch (e) {
    showError(notification, e)
  }
}

export const pieChartColors = () => {
  return [
    "#4CA5A9",
    "#8ECACD",
    "#BCDBDF",
    "#C8E3E3",
    "#D9E9EB",
    "#E4F0F1",
    "#F1F8F8",
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

export const safe = (notification: Notification, f: () => void) => {
  try {
    f()
  } catch (e) {
    showError(notification, e)
  }
}

export const showError = (notification: Notification, error: any) => {
  const e: FrError = error
  notification.error(toDefaultErrorMsg(error))
}
