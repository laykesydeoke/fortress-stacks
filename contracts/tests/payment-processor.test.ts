import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("payment-processor", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("can create a payment and returns id 0", () => {
    const { result } = simnet.callPublicFn(
      "payment-processor",
      "create-payment",
      [Cl.principal(wallet2), Cl.uint(100000), Cl.none()],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("increments payment nonce after creation", () => {
    simnet.callPublicFn(
      "payment-processor",
      "create-payment",
      [Cl.principal(wallet2), Cl.uint(50000), Cl.none()],
      wallet1
    );

    const { result } = simnet.callReadOnlyFn(
      "payment-processor",
      "get-payment-nonce",
      [],
      deployer
    );
    expect(result).toBeUint(1);
  });

  it("can read payment details after creation", () => {
    simnet.callPublicFn(
      "payment-processor",
      "create-payment",
      [Cl.principal(wallet2), Cl.uint(100000), Cl.none()],
      wallet1
    );

    const { result } = simnet.callReadOnlyFn(
      "payment-processor",
      "get-payment",
      [Cl.uint(0)],
      deployer
    );
    expect(result).toBeSome(
      Cl.tuple({
        business: Cl.principal(wallet2),
        amount: Cl.uint(100000),
        customer: Cl.none(),
        status: Cl.stringAscii("pending"),
        "created-at": Cl.uint(3),
        "confirmed-at": Cl.none(),
      })
    );
  });

  it("can create payment with customer address", () => {
    const { result } = simnet.callPublicFn(
      "payment-processor",
      "create-payment",
      [Cl.principal(wallet2), Cl.uint(200000), Cl.some(Cl.principal(wallet1))],
      deployer
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("rejects payment with zero amount", () => {
    const { result } = simnet.callPublicFn(
      "payment-processor",
      "create-payment",
      [Cl.principal(wallet2), Cl.uint(0), Cl.none()],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(402));
  });

  it("returns none for non-existent payment", () => {
    const { result } = simnet.callReadOnlyFn(
      "payment-processor",
      "get-payment",
      [Cl.uint(999)],
      deployer
    );
    expect(result).toBeNone();
  });

  it("rejects confirm on non-existent payment", () => {
    const { result } = simnet.callPublicFn(
      "payment-processor",
      "confirm-payment",
      [Cl.uint(999)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(404));
  });

  it("rejects refund on non-existent payment", () => {
    const { result } = simnet.callPublicFn(
      "payment-processor",
      "refund-payment",
      [Cl.uint(999)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(404));
  });

  it("rejects confirm from unauthorized user", () => {
    simnet.callPublicFn(
      "payment-processor",
      "create-payment",
      [Cl.principal(wallet2), Cl.uint(50000), Cl.some(Cl.principal(wallet1))],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "payment-processor",
      "confirm-payment",
      [Cl.uint(0)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(401));
  });
});
