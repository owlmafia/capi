import redArrow from "../images/svg/arrow.svg"

export const ShareSupply = ({ supply }: { supply: string }) => {
  return (
    <div className="mb-16 flex-block align-center">
      <div className="desc">{"Share supply"}</div>
      <div className="label_30_on_acc">{supply}</div>
      <div className="arrow-container">
        <img src={redArrow.src} alt="redArrow" />
      </div>
    </div>
  )
}
