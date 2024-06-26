import { CopyToClipboard } from "react-copy-to-clipboard"
import myalgo from "../images/svg/myalgo.svg"
import { Notification } from "../components/Notification"
// import checkmark from "../images/svg/checkmark.svg";

const CopyPasteText = ({
  notification,
  text,
  copyText: copyTextOpt,
  copyMsg,
}: {
  notification: Notification
  // text to show as label
  text: string
  // text to be copied - defaults to text shown if not passed
  copyText?: string
  // notification message (e.g. "x was copied to clipboard")
  copyMsg: string
}) => {
  return (
    <CopyPasteHtml
      element={<div className="grey-190">{text}</div>}
      copyText={copyTextOpt ?? text}
      notification={notification}
      copyMsg={copyMsg}
    />
  )
}

export default CopyPasteText

export const CopyPasteHtml = ({ notification, element, copyText, copyMsg }) => {
  //   const [isCopied, _setIsCopied] = useState(false);
  const isCopied = false

  const onCopy = () => {
    if (copyMsg) {
      notification.success(copyMsg, true)
    }
  }

  return (
    <CopyToClipboard text={copyText} onCopy={onCopy}>
      <div className="flex cursor-pointer items-center gap-3 text-50 text-ne4">
        {element}
        {/* <span className="ft-weight-600">{isCopied ? "Copied!" : null}</span> */}
        <span className={isCopied ? "active" : ""}>
          {isCopied ? (
            // <img className="cursor-pointer" src={checkmark.src} alt="checkmark" />
            <img
              className="h-3 w-3 cursor-pointer"
              src={myalgo.src}
              alt="myalgo"
            />
          ) : (
            <img
              className="h-3 w-3 max-w-none cursor-pointer"
              src={myalgo.src}
              alt="myalgo"
            />
          )}
        </span>
      </div>
    </CopyToClipboard>
  )
}

export const CopyPasteCompleteText = ({
  text,
  copyTextOpt,
}: {
  text: string
  copyTextOpt?: string
}) => {
  return (
    <CopyPasteCompleteHtml
      element={<div className="grey-190">{text}</div>}
      copyText={copyTextOpt ?? text}
    />
  )
}

export const CopyPasteCompleteHtml = ({ element, copyText }) => {
  return (
    <CopyToClipboard text={copyText}>
      <div className="clickable ft-size-18 d-flex gap-18">
        <span>{element}</span>
      </div>
    </CopyToClipboard>
  )
}
