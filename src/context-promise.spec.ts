import { ContextPromise } from "./context-promise";

it("ContextPromise is defined", () => {
  expect(ContextPromise).toBeTruthy();
});

it("Basic promise", () => {
  const p = new ContextPromise(Promise.resolve({ greeting: "howdy" }));
  return expect(p).resolves.toEqual({ greeting: "howdy" });
});

it("Basic chaining", () => {
  const p = new ContextPromise(
    Promise.resolve({ greeting: "howdy" })
  ).then(c => ({ greets: c.greeting }));

  return expect(p).resolves.toEqual({ greeting: "howdy", greets: "howdy" });
});

it("Raining example", () => {
  const promptZip = () => Promise.resolve("94107");
  const getTemp = (zip: string) => Promise.resolve(50);
  const getRain = (zip: string) => Promise.resolve(true);
  const shouldWearJacket = (temp: number, raining: boolean) => {
    return temp <= 50 || raining;
  };

  const p = new ContextPromise(promptZip().then(zip => ({ zip })))
    .then(c => getTemp(c.zip).then(temp => ({ temp })))
    .then(c => getRain(c.zip).then(rain => ({ rain })))
    .then(c => ({ should: shouldWearJacket(c.temp, c.rain) }));

  return expect(p).resolves.toHaveProperty("should");
});

