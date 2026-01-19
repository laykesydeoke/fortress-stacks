;; title: treasury-manager
;; version: 2.0.0
;; summary: Automated treasury management with yield optimization
;; description: Manages business sBTC treasuries with automated yield strategies

;; constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u402))
(define-constant ERR-INVALID-THRESHOLD (err u403))
(define-constant ERR-TRANSFER-FAILED (err u404))

;; data maps
(define-map treasury-config
  principal
  {
    liquidity-threshold: uint,
    total-balance: uint,
    liquid-balance: uint,
    yield-balance: uint,
    last-rebalance: uint
  }
)

;; public functions
(define-public (set-liquidity-threshold (threshold uint))
  (begin
    (asserts! (<= threshold u100) ERR-INVALID-THRESHOLD)
    (let ((current-config (default-to
                            {liquidity-threshold: u20, total-balance: u0, liquid-balance: u0, yield-balance: u0, last-rebalance: u0}
                            (map-get? treasury-config tx-sender))))
      (map-set treasury-config tx-sender (merge current-config {
        liquidity-threshold: threshold
      }))
      (print {event: "threshold-set", business: tx-sender, threshold: threshold})
      (ok true)
    )
  )
)

(define-public (deposit-to-treasury (amount uint))
  (let ((current-config (default-to
                          {liquidity-threshold: u20, total-balance: u0, liquid-balance: u0, yield-balance: u0, last-rebalance: u0}
                          (map-get? treasury-config tx-sender))))
    (asserts! (> amount u0) ERR-INVALID-THRESHOLD)

    ;; Transfer sBTC from user to contract owner (treasury custodian)
    (match (contract-call? .sbtc-token transfer amount tx-sender CONTRACT_OWNER none)
      success (begin
        (map-set treasury-config tx-sender (merge current-config {
          total-balance: (+ (get total-balance current-config) amount),
          liquid-balance: (+ (get liquid-balance current-config) amount)
        }))
        (print {event: "treasury-deposit", business: tx-sender, amount: amount})
        (auto-rebalance)
      )
      error ERR-TRANSFER-FAILED
    )
  )
)

(define-public (withdraw-liquidity (amount uint))
  (let ((current-config (unwrap! (map-get? treasury-config tx-sender) ERR-NOT-AUTHORIZED)))
    (asserts! (<= amount (get liquid-balance current-config)) ERR-INSUFFICIENT-LIQUIDITY)

    ;; Update balances
    (map-set treasury-config tx-sender (merge current-config {
      total-balance: (- (get total-balance current-config) amount),
      liquid-balance: (- (get liquid-balance current-config) amount)
    }))

    (print {event: "treasury-withdrawal", business: tx-sender, amount: amount})
    (ok true)
  )
)

;; Owner sends sBTC back to business for withdrawal
(define-public (process-withdrawal (business principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-THRESHOLD)
    (match (contract-call? .sbtc-token transfer amount CONTRACT_OWNER business none)
      success (begin
        (print {event: "withdrawal-processed", business: business, amount: amount})
        (ok true)
      )
      error ERR-TRANSFER-FAILED
    )
  )
)

(define-public (emergency-withdraw-all)
  (let ((current-config (unwrap! (map-get? treasury-config tx-sender) ERR-NOT-AUTHORIZED)))
    (map-set treasury-config tx-sender {
      liquidity-threshold: (get liquidity-threshold current-config),
      total-balance: u0,
      liquid-balance: u0,
      yield-balance: u0,
      last-rebalance: stacks-block-height
    })
    (print {event: "emergency-withdrawal", business: tx-sender, amount: (get total-balance current-config)})
    (ok (get total-balance current-config))
  )
)

;; private functions
(define-private (auto-rebalance)
  (match (map-get? treasury-config tx-sender)
    config (let ((target-liquid (/ (* (get total-balance config) (get liquidity-threshold config)) u100))
                 (excess-liquid (if (> (get liquid-balance config) target-liquid)
                                   (- (get liquid-balance config) target-liquid)
                                   u0)))
             (if (> excess-liquid u0)
               (deploy-to-yield excess-liquid)
               (ok true)
             ))
    (ok true)
  )
)

(define-private (deploy-to-yield (amount uint))
  (match (map-get? treasury-config tx-sender)
    config (begin
             (map-set treasury-config tx-sender (merge config {
               liquid-balance: (- (get liquid-balance config) amount),
               yield-balance: (+ (get yield-balance config) amount),
               last-rebalance: stacks-block-height
             }))
             (ok true))
    (ok true)
  )
)

;; read only functions
(define-read-only (get-treasury-info (business principal))
  (map-get? treasury-config business)
)

(define-read-only (calculate-optimal-allocation (business principal))
  (match (map-get? treasury-config business)
    config (let ((total (get total-balance config))
                 (threshold (get liquidity-threshold config)))
             (ok {
               target-liquid: (/ (* total threshold) u100),
               target-yield: (/ (* total (- u100 threshold)) u100),
               current-liquid: (get liquid-balance config),
               current-yield: (get yield-balance config)
             }))
    (err ERR-NOT-AUTHORIZED)
  )
)
