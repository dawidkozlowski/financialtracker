import { describe, expect, it } from "vitest";

describe("finance math", () => {
  it("should calculate balance", () => {
    const transactions = [
      { kind: "income", amount: 3000 },
      { kind: "expense", amount: 1200 }
    ];
    const balance = transactions.reduce((acc, tx) => tx.kind === "income" ? acc + tx.amount : acc - tx.amount, 0);
    expect(balance).toBe(1800);
  });
});
