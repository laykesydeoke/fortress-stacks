;; title: treasury-manager
;; version: 1.0.0
;; summary: Automated treasury management with yield optimization
;; description: Manages business sBTC treasuries with automated yield strategies

;; constants
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u402))
(define-constant ERR-INVALID-THRESHOLD (err u403))

;; data maps
(define-map treasury-config
  principal
  {
    liquidity-threshold: uint, ;; percentage (0-100)
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
      (ok true)
    )
  )
)

(define-public (deposit-to-treasury (amount uint))
  (let ((current-config (default-to 
                          {liquidity-threshold: u20, total-balance: u0, liquid-balance: u0, yield-balance: u0, last-rebalance: u0}
                          (map-get? treasury-config tx-sender))))
    
    ;; Transfer sBTC to contract (simplified for MVP)
    ;; (try! (contract-call? .sbtc-token transfer amount tx-sender (as-contract tx-sender) none))
    
    ;; Update balances
    (map-set treasury-config tx-sender (merge current-config {
      total-balance: (+ (get total-balance current-config) amount),
      liquid-balance: (+ (get liquid-balance current-config) amount)
    }))
    
    ;; Trigger rebalancing if needed
    (auto-rebalance)
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
    
    ;; Transfer sBTC back to user (simplified for MVP)
    ;; (try! (as-contract (contract-call? .sbtc-token transfer amount (as-contract tx-sender) tx-sender none)))
    
    (ok true)
  )
)

(define-public (emergency-withdraw-all)
  (let ((current-config (unwrap! (map-get? treasury-config tx-sender) ERR-NOT-AUTHORIZED)))
    ;; In a real implementation, this would pull funds from yield protocols
    ;; and return all funds to the business owner
    (map-set treasury-config tx-sender {
      liquidity-threshold: (get liquidity-threshold current-config),
      total-balance: u0,
      liquid-balance: u0,
      yield-balance: u0,
      last-rebalance: stacks-block-height
    })
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
  ;; Integration with yield protocols (simplified for MVP)
  ;; In full implementation, this would interact with actual DeFi protocols
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

