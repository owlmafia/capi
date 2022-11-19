import React, { useEffect, useState } from "react"
import Link from "next/link"
import funds from "../images/funds.svg"
import { changeArrow, safe, shortedAddress } from "../functions/utils"
import CopyPasteText from "./CopyPastText"
import { CompactFundsActivityEntry } from "./CompactFundsActivityEntry"
import Progress from "./Progress"
import { Deps } from "../context/AppContext"

export const FundsActivityEmbedded = ({ deps, daoId }) => {
  const [dao, setDao] = useState(null)

  updateDao(deps, daoId, setDao)
  updateFundsActivity(deps, daoId)

  const hasEntries = () => {
    return deps.compactFundsActivity && deps.compactFundsActivity.length > 0
  }

  const view = () => {
    if (deps.funds || dao || hasEntries()) {
      return <Box deps={deps} dao={dao} hasEntries={hasEntries} />
    } else {
      return null
    }
  }

  return <div>{view()}</div>
}

const Box = ({ deps, dao, hasEntries }) => {
  return (
    <div className="first_dao_widget">
      {deps.funds && <Funds deps={deps} />}
      {dao && <Wallet deps={deps} dao={dao} />}
      {hasEntries() && <ActivityContainer deps={deps} />}
    </div>
  )
}

const Funds = ({ deps }) => {
  return (
    <div className="d-flex flex-column gap-12">
      <div className="desc">{"Project funds"}</div>
      <div className="d-flex align-center gap-10">
        <img src={funds.src} alt="funds" />
        <div className="subtitle">{deps.funds}</div>
        <div>{changeArrow(deps.fundsChange)}</div>
      </div>
    </div>
  )
}

const Wallet = ({ deps, dao }) => {
  return (
    <div className="project-wallet">
      <div className="grey-190">{"Project wallet address:"}</div>
      <CopyPasteText
        text={shortedAddress(dao.app_address)}
        copyText={dao.app_address}
        notification={deps.notification}
        copyMsg={"Address copied to clipboard"}
      />
    </div>
  )
}

const ActivityContainer = ({ deps }) => {
  return (
    <div>
      <div className="mt-32 ft-weight-600 mb-32 ft-size-18">
        {"Recent funds activity"}
      </div>
      <Activity deps={deps} />
      <Link className="text-center d-flex justify-center" href="funds_activity">
        <button className="link_button">{"See all"}</button>
      </Link>
    </div>
  )
}

const Activity = ({ deps }) => {
  if (deps.compactFundsActivity) {
    if (deps.compactFundsActivity.length > 0) {
      return (
        <div>
          {deps.compactFundsActivity.map((entry) => (
            <CompactFundsActivityEntry
              entry={entry}
              showDescr={false}
              key={entry.tx_id}
            />
          ))}
        </div>
      )
    } else {
      return null
    }
  } else {
    return <Progress />
  }
}

const updateDao = (deps: Deps, daoId, setDao) => {
  useEffect(() => {
    if (deps.wasm) {
      safe(deps.notification, async () => {
        // TODO use dao in deps? - might need to call update
        let dao = await deps.wasm.bridge_load_dao(daoId)
        console.log("dao: " + JSON.stringify(dao))
        setDao(dao)
      })
    }
  }, [deps.wasm, daoId, deps.notification])
}

const updateFundsActivity = (deps: Deps, daoId) => {
  useEffect(() => {
    deps.updateCompactFundsActivity.call(null, daoId)
  }, [deps.updateCompactFundsActivity, daoId])
}