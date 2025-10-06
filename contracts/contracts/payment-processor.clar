;; title: payment-processor
;; version: 1.0.0
;; summary: sBTC payment processing contract for businesses
;; description: Handles payment creation, confirmation, and business treasury integration

;; constants
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-INSUFFICIENT-BALANCE (err u402))
(define-constant ERR-PAYMENT-NOT-FOUND (err u404))
(define-constant ERR-ALREADY-CONFIRMED (err u409))

;; data vars
(define-data-var contract-owner principal tx-sender)
(define-data-var payment-nonce uint u0)

;; data maps
(define-map payments
  uint
  {
    business: principal,
    amount: uint,
    customer: (optional principal),
    status: (string-ascii 20),
    created-at: uint,
    confirmed-at: (optional uint)
  }
)

;; public functions
(define-public (create-payment (business principal) (amount uint) (customer (optional principal)))
  (let ((payment-id (var-get payment-nonce)))
    (map-set payments payment-id {
      business: business,
      amount: amount,
      customer: customer,
      status: "pending",
      created-at: stacks-block-height,
      confirmed-at: none
    })
    (var-set payment-nonce (+ payment-id u1))
    (ok payment-id)
  )
)

(define-public (confirm-payment (payment-id uint))
  (let ((payment (unwrap! (map-get? payments payment-id) ERR-PAYMENT-NOT-FOUND)))
    (asserts! (is-eq (get customer payment) (some tx-sender)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status payment) "pending") ERR-ALREADY-CONFIRMED)
    
    ;; Transfer sBTC to business (simplified for MVP - would integrate with actual sBTC token)
    ;; (try! (contract-call? .sbtc-token transfer 
    ;;        (get amount payment) 
    ;;        tx-sender 
    ;;        (get business payment) 
    ;;        none))
    
    ;; Update payment status
    (map-set payments payment-id (merge payment {
      status: "confirmed",
      confirmed-at: (some stacks-block-height)
    }))
    
    (ok true)
  )
)

(define-public (refund-payment (payment-id uint))
  (let ((payment (unwrap! (map-get? payments payment-id) ERR-PAYMENT-NOT-FOUND)))
    (asserts! (is-eq (get business payment) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status payment) "confirmed") ERR-NOT-AUTHORIZED)
    
    ;; Update payment status
    (map-set payments payment-id (merge payment {
      status: "refunded"
    }))
    
    (ok true)
  )
)

;; read only functions
(define-read-only (get-payment (payment-id uint))
  (map-get? payments payment-id)
)

(define-read-only (get-payment-nonce)
  (var-get payment-nonce)
)
