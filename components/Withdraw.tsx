import { useEffect, useState } from "react"
import { Deps } from "../context/AppContext"
import { safe, showError } from "../functions/utils"
import { useDaoId } from "../hooks/useDaoId"
import pencil from "../images/svg/pencil.svg"
import { SetBool } from "../type_alias"
import { Funds } from "./Funds"
import { InteractiveBox } from "./InteractiveBox"
import { LabeledCurrencyInput, LabeledTextArea } from "./labeled_inputs"
import Progress from "./Progress"
import { SubmitButton } from "./SubmitButton"

export const Withdraw = ({ deps }: { deps: Deps }) => {
  let daoId = useDaoId()

  const [withdrawalAmount, setWithdrawalAmount] = useState("10")
  const [withdrawalDescr, setWithdrawalDescr] = useState("Type the reason")
  const [submitting, setSubmitting] = useState(false)

  updateDao(deps, daoId)

  const view = () => {
    if (deps.dao) {
      return (
        <InteractiveBox
          title={"Withdraw Funds from project"}
          noTitleBottomMargin={true}
        >
          <>
            <Funds
              funds={deps.funds}
              showWithdrawLink={false}
              daoId={daoId}
              containerClassNameOpt="dao_funds__cont_in_withdraw"
            />
            <div className="mt-10" />
            <LabeledCurrencyInput
              label={"How much?"}
              inputValue={withdrawalAmount}
              labelColor="text-bg"
              onChange={(input) => setWithdrawalAmount(input)}
              bgColor={"bg-inp"}
              placeholderColor={"text-te3"}
            />
            <LabeledTextArea
              labelColor="text-bg"
              label={"For what?"}
              img={pencil}
              inputValue={withdrawalDescr}
              onChange={(input) => setWithdrawalDescr(input)}
              maxLength={200} // NOTE: has to match WASM
              rows={3}
              bgColor={"bg-inp"}
              placeholderColor={"text-te3"}
            />

            <SubmitButton
              label={"Withdraw"}
              isLoading={submitting}
              disabled={deps.myAddress === ""}
              width="w-60"
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
          </>
        </InteractiveBox>
      )
    } else {
      return <Progress />
    }
  }

  return <div>{view()}</div>
}

const updateDao = (deps: Deps, daoId: string) => {
  useEffect(() => {
    safe(deps.notification, async () => {
      deps.updateDao.call(null, daoId)
    })
  }, [daoId])
}

const withdraw = async (
  deps: Deps,
  showProgress: SetBool,
  daoId: string,
  withdrawalAmount: string,
  withdrawalDescr: string
) => {
  try {
    showProgress(true)
    let withdrawRes = await deps.wasm.withdraw({
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
    let submitWithdrawRes = await deps.wasm.submitWithdraw({
      txs: withdrawResSigned,
      pt: withdrawRes.pt,
    })

    console.log("submitWithdrawRes: " + JSON.stringify(submitWithdrawRes))

    deps.notification.success("Withdrawal request submitted")
    showProgress(false)

    await deps.updateMyBalance(deps.myAddress)
    await deps.updateFunds(daoId)
  } catch (e) {
    showError(deps.notification, e)
    showProgress(false)
  }
}
