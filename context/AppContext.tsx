import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import "react-toastify/dist/ReactToastify.css"
import { NotificationCreator, Notification } from "../components/Notification"
import { checkForUpdates, safe } from "../functions/utils"
import { updateFunds_, updateInvestmentData_ } from "../functions/shared"
import { shortedAddress } from "../functions/utils"
import { useWindowSize } from "../hooks/useWindowSize"
import { initWcWalletIfAvailable } from "../wallet/walletConnectWallet"
import { WASMContext } from "./WASMContext"
import { Wallet } from "../wallet/Wallet"
import { SetWallet } from "../type_alias"

const initial: IAppContext = {}

export const AppContext = createContext(initial)

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  const [myAddress, setMyAddress] = useState("")

  const [myBalance, setMyBalance] = useState("")

  const [myShares, setMyShares] = useState(null)
  const [myDividend, setMyDividend] = useState(null)
  const [funds, setFunds] = useState(null)
  const [fundsChange, setFundsChange] = useState(null)
  const [daoVersion, setDaoVersion] = useState(null)

  const [myAddressDisplay, setMyAddressDisplay] = useState("")
  const [modal, setModal] = useState(null)

  const [investmentData, setInvestmentData] = useState(null)

  const [dao, setDao] = useState(null)

  const [notification] = useState(NotificationCreator())
  const [wallet, setWallet] = useState<Wallet>(null)

  const windowSize = useWindowSize()

  const [availableShares, setAvailableShares] = useState(null)
  const [availableSharesNumber, setAvailableSharesNumber] = useState(null)
  const [raisedFundsNumber, setRaisedFundsNumber] = useState(null)
  const [raisedFunds, setRaisedFunds] = useState(null)
  const [raiseState, setRaiseState] = useState(null)

  const [compactFundsActivity, setCompactFundsActivity] = useState(null)

  const [sharesDistr, setSharesDistr] = useState(null)
  const [notOwnedShares, setNotOwnedShares] = useState(null)
  const [holdersChange, setHoldersChange] = useState(null)

  // this is only used when the selected wallet is wallet connect
  const [wcShowOpenWalletModal, setWcShowOpenWalletModal] = useState(false)

  const { wasm } = useContext(WASMContext)

  useEffect(() => {
    initWcWalletIfAvailable(
      notification,
      setMyAddress,
      setWallet,
      setWcShowOpenWalletModal
    )
  }, [notification])

  const updateMyBalance = useCallback(
    async (myAddress) => {
      if (wasm && myAddress) {
        safe(notification, async () => {
          const balance = await wasm.balance({ address: myAddress })
          console.log("Balance update res: %o", balance)
          setMyBalance(balance)
        })
      }
    },
    [wasm, notification]
  )

  useEffect(() => {
    async function asyncInit() {
      if (wasm) {
        safe(notification, async () => await wasm.initLog())
      }
    }
    asyncInit()
  }, [wasm, notification])

  useEffect(() => {
    initWcWalletIfAvailable(
      notification,
      setMyAddress,
      setWallet,
      setWcShowOpenWalletModal
    )
  }, [notification])

  useEffect(() => {
    async function nestedAsync() {
      if (myAddress) {
        setMyAddressDisplay(shortedAddress(myAddress))
        await updateMyBalance(myAddress)
      }
    }
    nestedAsync()
  }, [myAddress, updateMyBalance])

  const updateAvailableShares = useCallback(
    async (daoId) => {
      if (wasm) {
        safe(notification, async () => {
          let res = await wasm.loadAvailableShares({
            dao_id: daoId,
          })
          setAvailableShares(res.available_shares)
          setAvailableSharesNumber(res.available_shares_number)
        })
      }
    },
    [wasm, notification]
  )

  const updateDao = useCallback(
    async (daoId) => {
      if (wasm && daoId) {
        safe(notification, async () => {
          let dao = await wasm.loadDao(daoId)
          setDao(dao)
          // // these are overwritten when draining, so we keep them separate
          // // TODO drain here? is this comment up to date?
          // setFunds(viewDao.available_funds);
        })
      }
    },
    [wasm, notification]
  )

  const updateShares = useCallback(
    async (daoId, myAddress) => {
      if (wasm && myAddress) {
        safe(notification, async () => {
          let mySharesRes = await wasm.myShares({
            dao_id: daoId,
            my_address: myAddress,
          })
          console.log("mySharesRes: %o", mySharesRes)
          setMyShares(mySharesRes)
        })
      }
    },
    [wasm, notification]
  )

  const updateInvestmentData = useCallback(
    async (daoId, myAddress) => {
      if (wasm && myAddress) {
        await updateInvestmentData_(
          wasm,
          notification,
          myAddress,
          daoId,
          setInvestmentData
        )
      }
    },
    [wasm, notification]
  )

  const updateMyDividend = useCallback(
    async (daoId, myAddress) => {
      if (wasm && myAddress) {
        safe(notification, async () => {
          let myDividendRes = await wasm.myDividend({
            dao_id: daoId,
            investor_address: myAddress,
          })
          console.log("myDividendRes: %o", myDividendRes)
          setMyDividend(myDividendRes)
        })
      }
    },
    [wasm, notification]
  )

  const updateFunds = useCallback(
    async (daoId) => {
      if (wasm) {
        await updateFunds_(wasm, daoId, setFunds, setFundsChange, notification)
      }
    },
    [wasm, notification]
  )

  const updateDaoVersion = useCallback(
    async (daoId) => {
      if (wasm) {
        await checkForUpdates(wasm, notification, daoId, setDaoVersion)
      }
    },
    [wasm, notification]
  )

  const updateRaisedFunds = useCallback(
    async (daoId) => {
      if (wasm) {
        safe(notification, async () => {
          let funds = await wasm.raisedFunds({ dao_id: daoId })
          setRaisedFunds(funds.raised)
          setRaisedFundsNumber(funds.raised_number)
          setRaiseState(stateObj(funds.state, funds.goal_exceeded_percentage))
        })
      }
    },
    [wasm, notification]
  )

  const updateCompactFundsActivity = useCallback(
    async (daoId) => {
      if (wasm) {
        safe(deps.notification, async () => {
          const res = await deps.wasm.loadFundsActivity({
            dao_id: daoId,
            max_results: "3",
          })
          console.log("compact funds activity res: " + JSON.stringify(res))
          setCompactFundsActivity(res.entries)
        })
      }
    },
    [notification, wasm]
  )

  const updateSharesDistr = useCallback(
    async (dao) => {
      if (wasm && dao) {
        safe(notification, async () => {
          let distrRes = await wasm.sharesDistribution({
            asset_id: dao.shares_asset_id,
            share_supply: dao.share_supply_number,
            app_id: dao.app_id,
          })
          console.log("Shares distribution res: " + JSON.stringify(distrRes))

          // remember original index to get chart segment color
          // we need this, because the displayed entries are filtered ("show less" state)
          // so their indices don't correspond to the chart (which displays all the holders)
          const holdersWithIndex = distrRes.holders.map((holder, index) => {
            holder.originalIndex = index
            return holder
          })

          setSharesDistr(holdersWithIndex)
          setNotOwnedShares(distrRes.not_owned_shares)

          let holdersRes = await wasm.holdersChange({
            asset_id: dao.shares_asset_id,
            app_id: dao.app_id,
          })
          console.log("Holders change res: " + JSON.stringify(holdersRes))

          setHoldersChange(holdersRes.change)
        })
      }
    },
    [wasm, notification]
  )

  const deps = {
    // conditional features
    features: {
      prospectus: true,
      minMaxInvestment: true,
      // shows info labels in diverse places when the project hasn't finished the fundsraising phase
      stillRaisingFundsLabels: true,
      developer: true,
      team: true,
    },

    myAddress: myAddress,
    setMyAddress: setMyAddress,

    myAddressDisplay: myAddressDisplay,
    setMyAddressDisplay: setMyAddressDisplay,

    modal: modal,
    setModal: setModal,

    notification: notification,

    myBalance: myBalance,
    updateMyBalance: updateMyBalance,

    myShares: myShares,
    updateMyShares: updateShares,

    myDividend: myDividend,
    updateMyDividend: updateMyDividend,

    investmentData: investmentData,
    updateInvestmentData: updateInvestmentData,

    funds: funds,
    updateFunds: updateFunds,

    fundsChange: fundsChange,

    dao: dao,
    updateDao: updateDao,

    daoVersion: daoVersion,
    updateDaoVersion: updateDaoVersion,

    wallet: wallet,
    setWallet: setWallet,

    wcShowOpenWalletModal: wcShowOpenWalletModal,
    setWcShowOpenWalletModal: setWcShowOpenWalletModal,

    availableShares: availableShares,
    availableSharesNumber: availableSharesNumber,
    updateAvailableShares: updateAvailableShares,

    updateRaisedFunds: updateRaisedFunds,
    raisedFundsNumber: raisedFundsNumber,
    raisedFunds: raisedFunds,
    raiseState: raiseState,

    updateCompactFundsActivity: updateCompactFundsActivity,
    compactFundsActivity: compactFundsActivity,

    updateSharesDistr: updateSharesDistr,
    sharesDistr: sharesDistr,
    notOwnedShares: notOwnedShares,
    holdersChange: holdersChange,

    size: windowSizeClasses(windowSize),

    wasm: wasm,
  }
  return (
    <AppContext.Provider value={{ deps: deps }}>{children}</AppContext.Provider>
  )
}

interface IAppContext {
  // optional just for ts, which needs a default state
  // this is set synchronously so we expect it to be always set
  // TODO better solution?
  deps?: Deps
}

export interface Deps {
  features: Features

  myAddress: any
  setMyAddress: any

  myAddressDisplay: any
  setMyAddressDisplay: any

  modal: any
  setModal: any

  notification: Notification

  myBalance: any
  updateMyBalance: any

  myShares: any
  updateMyShares: any

  myDividend: any
  updateMyDividend: any

  investmentData: any
  updateInvestmentData: any

  funds: any
  updateFunds: any

  fundsChange: any

  dao: any
  updateDao: any

  daoVersion: any
  updateDaoVersion: any

  wallet: Wallet
  setWallet: SetWallet

  wcShowOpenWalletModal: any
  setWcShowOpenWalletModal: any

  availableShares: any
  availableSharesNumber: any
  updateAvailableShares: any

  updateRaisedFunds: any
  raisedFundsNumber: any
  raisedFunds: any
  raiseState: any

  updateCompactFundsActivity: any
  compactFundsActivity: any

  updateSharesDistr: any
  sharesDistr: any
  notOwnedShares: any
  holdersChange: any

  size: any

  wasm: Wasm
}

export type Wasm =
  typeof import("/Users/ivanschuetz/dev/repo/github/capi/frontend/next/wasm/wasm")

interface AppContextProviderProps {
  children: ReactNode
}

interface Features {
  prospectus: boolean
  minMaxInvestment: boolean
  // shows info labels in diverse places when the project hasn't finished the fundsraising phase
  stillRaisingFundsLabels: boolean
  developer: boolean
  team: boolean
}

const SIZE_TABLET_THRESHOLD = 1330
const SIZE_PHONE_THRESHOLD = 600

// returns an object with all size classes, where at least one is expected to be true
// we use abstract identifiers like "s1", to accomodate possible new cases (phone-landscape, tablet with certain aspect ratio etc.) while keeping naming simple
const windowSizeClasses = (windowSize) => {
  const windowWidth = windowSize.width
  console.log("Window width updated: " + windowWidth)

  // Note: tablet and phone here implies portrait mode. Landscape hasn't been explicitly designed for or tested yet.
  const isTablet =
    windowWidth <= SIZE_TABLET_THRESHOLD && windowWidth > SIZE_PHONE_THRESHOLD
  const isPhone = windowWidth <= SIZE_PHONE_THRESHOLD

  return {
    s1: windowWidth > SIZE_TABLET_THRESHOLD, // desktop
    s2: isTablet,
    s3: isPhone,
    s4: isTablet || isPhone, // convenience size, so caller doesn't have to keep writing this
  }
}

const stateObj = (state, exceeded) => {
  var text
  var success

  if (state === "Raising") {
    return null // no message displayed when funds are still raising
  } else if (state === "GoalReached") {
    text = "The minimum target was reached"
    success = true
    // "6BB9BD";
  } else if (state === "GoalNotReached") {
    text = "The minimum target was not reached"
    success = false
    // success = "DE5C62";
  } else if (state === "GoalExceeded") {
    text = "The minumum target was exceeded by " + exceeded
    success = true
    // success = "6BB9BD";
  } else {
    throw Error("Invalid funds raise state: " + state)
  }

  return { text: text, success: success }
}
