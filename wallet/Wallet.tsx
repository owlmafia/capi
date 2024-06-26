export type Wallet = {
  id: string
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  onPageLoad: () => void
  signTxs: (txs: TxsToSign) => Promise<WalletSignedTx[]>
}

export type TxsToSign = {
  my_algo: MyAlgoTx[]
  wc: WcTx[]
}

// Transaction format expected by MyAlgo
// Marker type - we only pass the object through from Rust to MyAlgo
export type MyAlgoTx = any

// Transaction format expected by wallet connect
// Marker type - we only pass the object through from Rust to MyAlgo
export type WcTx = any

export type WalletSignedTx = {
  blob: number[]
}
