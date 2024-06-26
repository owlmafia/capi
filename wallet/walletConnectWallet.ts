import { formatJsonRpcRequest } from "@json-rpc-tools/utils"
import WalletConnect from "@walletconnect/client"
import QRCodeModal from "algorand-walletconnect-qrcode-modal"
import buffer from "buffer"
import { Notification } from "../components/Notification"
import { safe, showError } from "../functions/utils"
import { SetBool, SetString, SetWallet } from "../type_alias"
import { TxsToSign, Wallet, WalletSignedTx, WcTx } from "./Wallet"
const { Buffer } = buffer

type WcWallet = Wallet & {
  isConnected: () => boolean
  initSession: () => void
}

export function initWcWalletIfAvailable(
  notification: Notification,
  setMyAddress: SetString,
  setWallet: SetWallet,
  setWcShowOpenWalletModal: SetBool
) {
  const wallet = createWcWallet(
    notification,
    setMyAddress,
    setWcShowOpenWalletModal
  )
  if (wallet.isConnected()) {
    wallet.initSession()
    setWallet(wallet)
  }
}

// Note: the wallet connect and my algo wallets share the same "interface"
export function createWcWallet(
  notification: Notification,
  setMyAddress: SetString,
  setShowOpenWalletModal: SetBool
): WcWallet {
  const connector = createConnector()

  const onAddressUpdate = (address: string) => {
    setMyAddress(address)
  }

  const onDisconnect = () => {
    setMyAddress("")
  }

  // returns address, if needed for immediate use
  async function connect() {
    if (!window.Buffer) window.Buffer = Buffer
    safe(notification, async () => {
      if (!connector.connected) {
        await connector.createSession()
      }
      return initSession()
    })
  }

  async function disconnect() {
    if (!window.Buffer) window.Buffer = Buffer
    safe(notification, async () => {
      await connector.killSession()
      onDisconnect()
    })
  }

  function onPageLoad() {
    if (!window.Buffer) window.Buffer = Buffer
    safe(notification, async () => {
      if (connector.connected) {
        initSession()
      }
    })
  }

  function initSession() {
    if (!window.Buffer) window.Buffer = Buffer
    safe(notification, async () => {
      onConnectorConnected(connector, onAddressUpdate, onDisconnect)
    })
  }

  function isConnected() {
    return connector.connected
  }

  async function signTxs(toSign: TxsToSign): Promise<WalletSignedTx[]> {
    if (!window.Buffer) window.Buffer = Buffer
    // modal tells the user to look at the wallet (usually phone)
    setShowOpenWalletModal(true)
    let signed = await sign(connector, toSign.wc)
    setShowOpenWalletModal(false)
    return signed
  }

  return {
    id: "WC", // just to identify quickly wallet in logs
    connect,
    disconnect,
    onPageLoad,
    signTxs,

    // these functions are wallet connect specific (and only used in this file)
    // wallet connect preserves the connection between reloads, and they're needed to init the session
    isConnected,
    initSession,
  }
}

const createConnector = () => {
  return new WalletConnect({
    bridge: "https://bridge.walletconnect.org",
    qrcodeModal: QRCodeModal,
  })
}

const onConnectorConnected = (
  connector: WalletConnect,
  onAddressUpdate: SetString,
  onDisconnect: () => void
) => {
  // if accounts is set in connector, use it, also register to events
  // accounts is set when the page is loaded with an active session,
  // when the wallet is connected it's not set, we get the address from the events
  if (connector.accounts.length === 1) {
    var address = connector.accounts[0]
    console.log("selected address: %o", address)
    onAddressUpdate(address)
  } else if (connector.accounts.length > 1) {
    throw new Error(
      "Unexpected WalletConnect accounts length (connection): " +
        connector.accounts.length
    )
  }

  console.log("connector connected: " + JSON.stringify(connector))
  subscribeToEvents(connector, onAddressUpdate, onDisconnect)
}

const subscribeToEvents = (
  connector: WalletConnect,
  onAddressUpdate: SetString,
  onDisconnect: () => void
) => {
  connector.on("connect", (error, payload) => {
    if (error) {
      throw error
    }
    const { accounts } = payload.params[0]
    if (accounts.length !== 1) {
      throw new Error(
        "Unexpected WalletConnect accounts length (update): " + accounts.length
      )
    }
    console.log("got an address update: " + accounts[0])
    onAddressUpdate(accounts[0])
  })

  connector.on("session_update", (error, payload) => {
    if (error) {
      throw error
    }

    const { accounts } = payload.params[0]
    console.log("Session update: " + JSON.stringify(accounts))
  })

  connector.on("disconnect", (error, payload) => {
    onDisconnect()
    if (error) {
      throw error
    }
  })
}

const sign = async (
  connector: WalletConnect,
  toSign: WcTx[]
): Promise<WalletSignedTx[]> => {
  const requestParams = [toSign]

  const request = formatJsonRpcRequest("algo_signTxn", requestParams)

  console.log("WalletConnect request: " + JSON.stringify(request))
  const signedTxs: any[] = await connector.sendCustomRequest(request)
  console.log("WalletConnect result: " + JSON.stringify(signedTxs))

  const decodedSignedTxs = signedTxs.map((tx) => decode(tx))
  console.log(
    "WalletConnect decodedSignedTxs: " + JSON.stringify(decodedSignedTxs)
  )

  return decodedSignedTxs
}

const decode = (wcTx: any): WalletSignedTx => {
  return { blob: Array.from(new Uint8Array(Buffer.from(wcTx, "base64"))) }
}
