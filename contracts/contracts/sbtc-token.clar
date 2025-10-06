;; sBTC Token - SIP-010 Compliant Fungible Token
;; Mimics mainnet sBTC behavior for testnet deployment

;; Define the token
(define-fungible-token sbtc-token)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))
(define-constant ERR_INVALID_AMOUNT (err u103))

;; Token metadata
(define-constant TOKEN_NAME "sBTC Token")
(define-constant TOKEN_SYMBOL "sBTC")
(define-constant TOKEN_DECIMALS u8)
(define-constant TOTAL_SUPPLY u2100000000000000) ;; 21M sBTC with 8 decimals

;; Mint initial supply to contract owner for distribution
(ft-mint? sbtc-token TOTAL_SUPPLY CONTRACT_OWNER)

;; SIP-010 Required Functions

;; Transfer function
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) ERR_NOT_TOKEN_OWNER)
    (try! (ft-transfer? sbtc-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; Get name
(define-read-only (get-name)
  (ok TOKEN_NAME)
)

;; Get symbol  
(define-read-only (get-symbol)
  (ok TOKEN_SYMBOL)
)

;; Get decimals
(define-read-only (get-decimals)
  (ok TOKEN_DECIMALS)
)

;; Get balance
(define-read-only (get-balance (account principal))
  (ok (ft-get-balance sbtc-token account))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply sbtc-token))
)

;; Get token URI (optional)
(define-read-only (get-token-uri)
  (ok (some "https://sbtc.tech/metadata.json"))
)

;; Admin Functions for Faucet-like Behavior

;; Faucet function - gives users sBTC for testing
(define-public (faucet (recipient principal) (amount uint))
  (begin
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (<= amount u100000000) ERR_INVALID_AMOUNT) ;; Max 1 sBTC per faucet call
    (try! (ft-transfer? sbtc-token amount CONTRACT_OWNER recipient))
    (ok true)
  )
)

;; Owner can mint more tokens if needed
(define-public (mint (recipient principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (try! (ft-mint? sbtc-token amount recipient))
    (ok true)
  )
)

;; Burn tokens (for sBTC withdrawal simulation)
(define-public (burn (amount uint))
  (begin
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (try! (ft-burn? sbtc-token amount tx-sender))
    (ok true)
  )
)

;; Helper function to get contract info
(define-read-only (get-contract-info)
  (ok {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    decimals: TOKEN_DECIMALS,
    total-supply: (ft-get-supply sbtc-token),
    owner: CONTRACT_OWNER
  })
)