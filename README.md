# ContextPromise

Chain promises without pulling hairs!

ContextPromise lets you write more maintainable Promise-based control flow by accumulating the results of your operations into one "context" object. This means you don't have to write complicated logic to combine the payloads of different async operations, and you can focus on making more plug-n-playable promises.

## Installation

```
$ npm install context-promise
```

A quick npm install should do the trick. The package has 0 dependencies, but it assumes an environment with `Promise` available globally.

## Usage

_Docs are in the works 😬. For in-depth examples of how to use ContextPromise, refer to the tests._

## An example...

Say you want to write an application that tells the user whether they should wear a jacket to work. You already have a few helper functions available:

```ts
promptZip(): Promise<string>
checkTemperature(zip: string): Promise<number>
checkRainForecast(zip: string): Promise<boolean>
shouldWearJacket(temp: number, willItRain: boolean): boolean
```

These look like these should fit together nicely, no? Hmm something like...

```ts
promptZip()
  .then(zip => checkTemperature(zip))
  .then(temperature...??? => checkRainForecast(zip??))
  .then(🤔)
```

See where it breaks down? Conventional promise chains make piecing together fragments of logic a little difficult. Here are a couple solutions:

#### Option A

Pull it out into higher-level state 😬

```ts
let zip, temp, rain;
promptZip()
  .then(z => zip = z)
  .then(() => checkTemperature(zip))
  .then(t => temp = t)
  .then(() => checkRainForecast(zip))
  .then(r => rain = r)
  .then(() => shouldWearJacket(temp, rain))
```

This solution will break down very quickly (for reasons that I hope are super obvious). Please don't use this approach!

#### Option B

Write some intermediate logic to bundle the results together

```ts
let zip, temp, rain;
promptZip()
  .then(zip => {
    return Promise.all([
      checkTemperature(zip),
      checkRainForecast(zip),
    ])
  }
  .then(values => shouldWearJacket(values[0], values[1]))
```

This solution works, but it's not a particularly maintainable approach. It's leaning on an implicit assumption about the ordering of `values`, and it doesn't present any obvious foothold for extending the functionality down the road.

### Enter ContextPromise 🙂

```ts
ContextPromise.fromBag({
  zip: promptZip()
})
  .then('temp', c => checkTemperature(c.zip))
  .then('rain', c => checkRainForecast(c.zip))
  .toPromise()
  .then(c => shouldWearJacket(c.temp, c.rain))
```

There we are.
