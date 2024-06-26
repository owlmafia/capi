import { useState } from "react"
import { DaoJs } from "wasm/wasm"
import { Deps } from "../context/AppContext"
import { showError } from "../functions/utils"
import { toValidationErrorMsg } from "../functions/validation"
import { SetBool, SetString } from "../type_alias"
import { LockOrUnlockShares } from "./LockOrUnlockShares"

export const LockShares = ({ deps, dao, daoId, onLockOpt }: LockSharesPars) => {
  const [submitting, setSubmitting] = useState(false)

  return (
    <LockOrUnlockShares
      dao={dao}
      investmentData={deps.investmentData}
      showInput={true}
      title={"Lock shares"}
      inputLabel={"Lock shares"}
      buttonLabel={"Lock"}
      submitting={submitting}
      onSubmit={async (input, setInputError) => {
        if (!deps.wasm) {
          // should be unlikely, as wasm should initialize quickly
          console.error("Click while wasm isn't ready. Ignoring.")
          return
        }

        await lock(
          deps,
          setSubmitting,
          daoId,
          dao,
          input,
          setInputError,
          onLockOpt
        )
      }}
    />
  )
}

export const lock = async (
  deps: Deps,
  showProgress: SetBool,
  daoId: string,
  dao: DaoJs,
  lockSharesCount: string,
  setInputError: SetString,
  onLockOpt?: () => void
) => {
  try {
    ///////////////////////////////////
    // TODO refactor invest/lock
    // 1. sign tx for app opt-in
    showProgress(true)
    let optInToAppsRes = await deps.wasm.optInToAppsIfNeeded({
      app_id: "" + dao.app_id,
      investor_address: deps.myAddress,
    })
    console.log("optInToAppsRes: " + JSON.stringify(optInToAppsRes))
    var optInToAppsSignedOptional = null
    if (optInToAppsRes.to_sign != null) {
      showProgress(false)
      optInToAppsSignedOptional = await deps.wallet.signTxs(
        optInToAppsRes.to_sign
      )
    }
    console.log(
      "optInToAppsSignedOptional: " + JSON.stringify(optInToAppsSignedOptional)
    )
    ///////////////////////////////////

    showProgress(true)
    // 2. buy the shares (requires app opt-in for local state)
    // TODO write which local state

    let lockRes = await deps.wasm.lock({
      dao_id: daoId,
      investor_address: deps.myAddress,
      share_count: lockSharesCount,
    })
    console.log("lockRes: " + JSON.stringify(lockRes))
    showProgress(false)

    let lockResSigned = await deps.wallet.signTxs(lockRes.to_sign)
    console.log("lockResSigned: " + JSON.stringify(lockResSigned))

    showProgress(true)

    let submitLockRes = await deps.wasm.submitLock({
      app_opt_ins: optInToAppsSignedOptional,
      txs: lockResSigned,
    })
    console.log("submitLockRes: " + JSON.stringify(submitLockRes))
    showProgress(false)

    deps.notification.success(
      "Congratulations! you locked " + lockSharesCount + " shares."
    )

    await deps.updateInvestmentData(daoId, deps.myAddress)
    await deps.updateMyBalance(deps.myAddress)
    await deps.updateMyShares(daoId, deps.myAddress)

    if (onLockOpt) {
      onLockOpt()
    }
  } catch (e) {
    if (e.id === "validation") {
      console.error("%o", e)
      setInputError(toValidationErrorMsg(e.details))
    } else {
      showError(deps.notification, e)
    }
    showProgress(false)
  }
}

type LockSharesPars = {
  deps: Deps
  dao: DaoJs
  daoId: string
  onLockOpt?: () => void
}
