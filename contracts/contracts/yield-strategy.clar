;; title: yield-strategy
;; version: 1.0.0
;; summary: Yield strategy management for DeFi protocol integration
;; description: Manages multiple yield strategies and protocol integrations

;; constants
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-STRATEGY-NOT-FOUND (err u404))
(define-constant ERR-INSUFFICIENT-FUNDS (err u402))
(define-constant ERR-INVALID-ALLOCATION (err u403))

;; data vars
(define-data-var strategy-nonce uint u0)

;; data maps
(define-map yield-strategies
  uint
  {
    business: principal,
    protocol: (string-ascii 50),
    allocation-percentage: uint, ;; 0-100
    deposited-amount: uint,
    earned-yield: uint,
    apy: uint, ;; in basis points (e.g., 500 = 5%)
    is-active: bool,
    created-at: uint,
    last-harvest: uint
  }
)

(define-map business-strategies
  principal
  (list 10 uint) ;; List of strategy IDs for a business
)

;; public functions
(define-public (create-strategy (protocol (string-ascii 50)) (allocation-percentage uint) (apy uint))
  (begin
    (asserts! (<= allocation-percentage u100) ERR-INVALID-ALLOCATION)
    (let ((strategy-id (var-get strategy-nonce)))
      (map-set yield-strategies strategy-id {
        business: tx-sender,
        protocol: protocol,
        allocation-percentage: allocation-percentage,
        deposited-amount: u0,
        earned-yield: u0,
        apy: apy,
        is-active: true,
        created-at: stacks-block-height,
        last-harvest: stacks-block-height
      })
      
      ;; Add strategy to business's strategy list
      (let ((current-strategies (default-to (list) (map-get? business-strategies tx-sender))))
        (map-set business-strategies tx-sender (unwrap! (as-max-len? (append current-strategies strategy-id) u10) ERR-INVALID-ALLOCATION))
      )
      
      (var-set strategy-nonce (+ strategy-id u1))
      (ok strategy-id)
    )
  )
)

(define-public (deposit-to-strategy (strategy-id uint) (amount uint))
  (let ((strategy (unwrap! (map-get? yield-strategies strategy-id) ERR-STRATEGY-NOT-FOUND)))
    (asserts! (is-eq (get business strategy) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (get is-active strategy) ERR-NOT-AUTHORIZED)
    
    ;; In real implementation, this would deposit to actual DeFi protocol
    ;; For MVP, we simulate the deposit
    (map-set yield-strategies strategy-id (merge strategy {
      deposited-amount: (+ (get deposited-amount strategy) amount)
    }))
    
    (ok true)
  )
)

(define-public (harvest-yield (strategy-id uint))
  (let ((strategy (unwrap! (map-get? yield-strategies strategy-id) ERR-STRATEGY-NOT-FOUND)))
    (asserts! (is-eq (get business strategy) tx-sender) ERR-NOT-AUTHORIZED)
    
    ;; Calculate yield based on time elapsed and APY
    (let ((blocks-elapsed (- stacks-block-height (get last-harvest strategy)))
          (deposited (get deposited-amount strategy))
          (apy (get apy strategy)))
      
      ;; Simplified yield calculation (blocks-elapsed / 52560 * apy / 10000 * deposited)
      ;; Assuming ~52560 blocks per year on Stacks
      (let ((yield-earned (/ (* (* blocks-elapsed apy) deposited) (* u52560 u10000))))
        (map-set yield-strategies strategy-id (merge strategy {
          earned-yield: (+ (get earned-yield strategy) yield-earned),
          last-harvest: stacks-block-height
        }))
        
        (ok yield-earned)
      )
    )
  )
)

(define-public (withdraw-from-strategy (strategy-id uint) (amount uint))
  (let ((strategy (unwrap! (map-get? yield-strategies strategy-id) ERR-STRATEGY-NOT-FOUND)))
    (asserts! (is-eq (get business strategy) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (<= amount (get deposited-amount strategy)) ERR-INSUFFICIENT-FUNDS)
    
    ;; Harvest yield before withdrawal
    (try! (harvest-yield strategy-id))
    
    ;; Update strategy with withdrawn amount
    (map-set yield-strategies strategy-id (merge strategy {
      deposited-amount: (- (get deposited-amount strategy) amount)
    }))
    
    (ok true)
  )
)

(define-public (deactivate-strategy (strategy-id uint))
  (let ((strategy (unwrap! (map-get? yield-strategies strategy-id) ERR-STRATEGY-NOT-FOUND)))
    (asserts! (is-eq (get business strategy) tx-sender) ERR-NOT-AUTHORIZED)
    
    (map-set yield-strategies strategy-id (merge strategy {
      is-active: false
    }))
    
    (ok true)
  )
)

;; read only functions
(define-read-only (get-strategy (strategy-id uint))
  (map-get? yield-strategies strategy-id)
)

(define-read-only (get-business-strategies (business principal))
  (map-get? business-strategies business)
)

(define-read-only (calculate-total-yield (business principal))
  (match (map-get? business-strategies business)
    strategy-ids (fold calculate-strategy-yield strategy-ids u0)
    u0
  )
)

;; private functions
(define-private (calculate-strategy-yield (strategy-id uint) (total uint))
  (match (map-get? yield-strategies strategy-id)
    strategy (+ total (get earned-yield strategy))
    total
  )
)

