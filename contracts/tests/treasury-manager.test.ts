import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("treasury-manager", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("can set liquidity threshold", () => {
    const { result } = simnet.callPublicFn(
      "treasury-manager",
      "set-liquidity-threshold",
      [Cl.uint(30)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects threshold above 100", () => {
    const { result } = simnet.callPublicFn(
      "treasury-manager",
      "set-liquidity-threshold",
      [Cl.uint(101)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(403));
  });

  it("returns none for uninitialized treasury", () => {
    const { result } = simnet.callReadOnlyFn(
      "treasury-manager",
      "get-treasury-info",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(result).toBeNone();
  });

  it("rejects withdrawal with no treasury config", () => {
    const { result } = simnet.callPublicFn(
      "treasury-manager",
      "withdraw-liquidity",
      [Cl.uint(1000)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(401));
  });

  it("rejects emergency withdraw with no config", () => {
    const { result } = simnet.callPublicFn(
      "treasury-manager",
      "emergency-withdraw-all",
      [],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(401));
  });

  it("can emergency withdraw after setting threshold", () => {
    simnet.callPublicFn(
      "treasury-manager",
      "set-liquidity-threshold",
      [Cl.uint(25)],
      wallet1
    );

    const { result } = simnet.callPublicFn(
      "treasury-manager",
      "emergency-withdraw-all",
      [],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("rejects process-withdrawal from non-owner", () => {
    const { result } = simnet.callPublicFn(
      "treasury-manager",
      "process-withdrawal",
      [Cl.principal(wallet1), Cl.uint(1000)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(401));
  });

  it("rejects optimal allocation for unknown business", () => {
    const { result } = simnet.callReadOnlyFn(
      "treasury-manager",
      "calculate-optimal-allocation",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(result.type).toBe("err");
  });
});
