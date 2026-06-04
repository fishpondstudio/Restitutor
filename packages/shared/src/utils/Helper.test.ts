import { expect, test } from "vitest";
import { formatNumber } from "./Helper";

test("formatNumber", () => {
   expect(formatNumber(1000.123)).toBe("1000.1");
   expect(formatNumber(-1000.123)).toBe("-1000.2");
   expect(formatNumber(1234.5678)).toBe("1234.5");
   expect(formatNumber(123456.789)).toBe("123.4K");
   expect(formatNumber(1234567.899)).toBe("1.234M");
   expect(formatNumber(-123456.789)).toBe("-123.5K");
   expect(formatNumber(12.3456)).toBe("12.34");
   expect(formatNumber(1.23456)).toBe("1.234");
});
