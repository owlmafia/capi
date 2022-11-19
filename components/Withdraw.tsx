import React, { useEffect, useState } from "react"
import Progress from "./Progress"
import { SubmitButton } from "./SubmitButton"
import { LabeledCurrencyInput, LabeledTextArea } from "./labeled_inputs"
import { Funds } from "./Funds"
import pencil from "../images/svg/pencil.svg"
import funds from "../images/funds.svg"
import { useDaoId } from "../hooks/useDaoId"
import { safe } from "../functions/utils"
import { Deps } from "../context/AppContext"

export const Withdraw = ({ deps }) => {
  let daoId = useDaoId()

  const [withdrawalAmount, setWithdrawalAmount] = useState("10")
  const [withdrawalDescr, setWithdrawalDescr] = useState("Type the reason")
  const [dao, setDao] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  updateDao(deps, daoId, setDao)

  const view = () => {
    if (dao) {
      return (
        <div className="box-container mt-80">
          <div className="title">{"Withdraw Funds from project"}</div>
          {/* <DaoName dao={dao} /> */}
          <Funds
            funds={deps.funds}
            showWithdrawLink={false}
            daoId={daoId}
            containerClassNameOpt="dao_funds__cont_in_withdraw"
          />
          <LabeledCurrencyInput
            label={"How much?"}
            inputValue={withdrawalAmount}
            img={funds}
            onChange={(input) => setWithdrawalAmount(input)}
          />
          <LabeledTextArea
            className="textarea-withdraw"
            label={"For what?"}
            img={pencil}
            inputValue={withdrawalDescr}
            onChange={(input) => setWithdrawalDescr(input)}
            maxLength={200} // NOTE: has to match WASM
            rows={3}
          />

          <SubmitButton
            label={"Withdraw"}
            className="button-primary"
            isLoading={submitting}
            disabled={deps.myAddress === ""}
            onClick={async () => {
              if (!deps.wasm) {
                // should be unlikely, as wasm should initialize quickly
                console.error("Click while wasm isn't ready. Ignoring.")
                return
              }

              await withdraw(
                deps,
                setSubmitting,
                daoId,
                withdrawalAmount,
                withdrawalDescr
              )
            }}
          />
        </div>
      )
    } else {
      return <Progress />
    }
  }

  return <div>{view()}</div>
}

const updateDao = (deps: Deps, daoId, setDao) => {
  useEffect(() => {
    safe(deps.notification, async () => {
      setDao(await deps.wasm.bridge_load_dao(daoId))
    })
  }, [deps.wasm, daoId, setDao, deps.notification])
}

const withdraw = async (
  deps: Deps,
  showProgress,
  daoId,
  withdrawalAmount,
  withdrawalDescr
) => {
  try {
    deps.notification.clear()

    showProgress(true)
    let withdrawRes = await deps.wasm.bridge_withdraw({
      dao_id: daoId,
      sender: deps.myAddress,
      withdrawal_amount: withdrawalAmount,
      description: withdrawalDescr,
    })
    // TODO update list with returned withdrawals list
    console.log("withdrawRes: " + JSON.stringify(withdrawRes))
    showProgress(false)

    let withdrawResSigned = await deps.wallet.signTxs(withdrawRes.to_sign)
    console.log("withdrawResSigned: " + withdrawResSigned)

    showProgress(true)
    let submitWithdrawRes = await deps.wasm.bridge_submit_withdraw({
      txs: withdrawResSigned,
      pt: withdrawRes.pt,
    })

    console.log("submitWithdrawRes: " + JSON.stringify(submitWithdrawRes))

    deps.notification.success("Withdrawal request submitted")
    showProgress(false)

    await deps.updateMyBalance(deps.myAddress)
    await deps.updateFunds(daoId)
  } catch (e) {
    deps.notification.error(e)
    showProgress(false)
  }
}