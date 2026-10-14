import { expect, it } from "vitest";
import { hostedLinks, triggerWithAmount } from "@/lib/pundar-links";

const ID = "11111111-1111-4111-8111-111111111111";

it("derives the public embed and trigger pages from the deployment URL", () => {
  expect(hostedLinks(`https://beta.app.paiflow.xyz/deployments/${ID}`)).toEqual({
    embedUrl: `https://beta.app.paiflow.xyz/deployments/${ID}/embed`,
    triggerUrl: `https://beta.app.paiflow.xyz/trigger/${ID}`,
  });
});

it("returns nothing outside team mode or for an unexpected URL", () => {
  expect(hostedLinks(null)).toBeNull();
  expect(hostedLinks("https://beta.app.paiflow.xyz/flows/abc")).toBeNull();
  expect(hostedLinks("not a url")).toBeNull();
});

it("adds a token amount hint only for a valid amount", () => {
  const t = `https://beta.app.paiflow.xyz/trigger/${ID}`;
  expect(triggerWithAmount(t, "50")).toBe(`${t}?amount=50`);
  expect(triggerWithAmount(t, "25.5")).toBe(`${t}?amount=25.5`);
  expect(triggerWithAmount(t, "abc")).toBe(t);
});
