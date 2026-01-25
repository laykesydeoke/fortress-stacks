import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("yield-strategy", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("can create a yield strategy", () => {
    const { result } = simnet.callPublicFn(
      "yield-strategy",
      "create-strategy",
      [Cl.stringAscii("stacking-dao"), Cl.uint(50), Cl.uint(850)],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(0));
  });

  it("rejects allocation above 100 percent", () => {
    const { result } = simnet.callPublicFn(
      "yield-strategy",
      "create-strategy",
      [Cl.stringAscii("alex"), Cl.uint(101), Cl.uint(500)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(403));
  });

  it("can deposit to an active strategy", () => {
    simnet.callPublicFn(
      "yield-strategy",
      "create-strategy",
      [Cl.stringAscii("stacking-dao"), Cl.uint(50), Cl.uint(850)],
      wallet1
    );

    const { result } = simnet.callPublicFn(
      "yield-strategy",
      "deposit-to-strategy",
      [Cl.uint(0), Cl.uint(500000)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects deposit from non-owner of strategy", () => {
    simnet.callPublicFn(
      "yield-strategy",
      "create-strategy",
      [Cl.stringAscii("velar"), Cl.uint(30), Cl.uint(600)],
      wallet1
    );

    const { result } = simnet.callPublicFn(
      "yield-strategy",
      "deposit-to-strategy",
      [Cl.uint(0), Cl.uint(100000)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(401));
  });

  it("rejects deposit to non-existent strategy", () => {
    const { result } = simnet.callPublicFn(
      "yield-strategy",
      "deposit-to-strategy",
      [Cl.uint(999), Cl.uint(100000)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(404));
  });

  it("can harvest yield from a strategy", () => {
    simnet.callPublicFn(
      "yield-strategy",
      "create-strategy",
      [Cl.stringAscii("stacking-dao"), Cl.uint(50), Cl.uint(850)],
      wallet1
    );
    simnet.callPublicFn(
      "yield-strategy",
      "deposit-to-strategy",
      [Cl.uint(0), Cl.uint(500000)],
      wallet1
    );
    simnet.mineEmptyBlocks(100);

    const { result } = simnet.callPublicFn(
      "yield-strategy",
      "harvest-yield",
      [Cl.uint(0)],
      wallet1
    );
    expect(result.type).toBe("ok");
  });

  it("can deactivate a strategy", () => {
    simnet.callPublicFn(
      "yield-strategy",
      "create-strategy",
      [Cl.stringAscii("alex"), Cl.uint(40), Cl.uint(500)],
      wallet1
    );

    const { result } = simnet.callPublicFn(
      "yield-strategy",
      "deactivate-strategy",
      [Cl.uint(0)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects deactivation from non-owner", () => {
    simnet.callPublicFn(
      "yield-strategy",
      "create-strategy",
      [Cl.stringAscii("alex"), Cl.uint(40), Cl.uint(500)],
      wallet1
    );

    const { result } = simnet.callPublicFn(
      "yield-strategy",
      "deactivate-strategy",
      [Cl.uint(0)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(401));
  });

  it("returns none for unknown business strategies", () => {
    const { result } = simnet.callReadOnlyFn(
      "yield-strategy",
      "get-business-strategies",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(result).toBeNone();
  });

  it("returns none for non-existent strategy", () => {
    const { result } = simnet.callReadOnlyFn(
      "yield-strategy",
      "get-strategy",
      [Cl.uint(999)],
      deployer
    );
    expect(result).toBeNone();
  });
});
