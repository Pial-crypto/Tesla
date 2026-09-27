import { describe, expect, it } from "vitest";
import { calcFare } from "../fare.js";

describe("calcFare", () => {
  it("calculates solo fare correctly", () => {
    const result = calcFare("Banani", "Gulshan 1", 1, false);

    expect(result.fare).toBe(9000);
    expect(result.solo).toBe(9000);
    expect(result.zoneDistance).toBe(2);
  });
});

it("applies pool discount correctly", () => {
  const result = calcFare("Banani", "Gulshan 1", 1, true);

  expect(result.solo).toBe(9000);
  expect(result.fare).toBe(7650);
});

it("multiplies fare by requested seats", () => {
  const result = calcFare("Banani", "Gulshan 1", 2, false);

  expect(result.solo).toBe(18000);
  expect(result.fare).toBe(18000);
});