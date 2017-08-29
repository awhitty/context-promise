import { ContextPromise } from './context-promise';

it('ContextPromise is defined', () => {
  expect(ContextPromise).toBeTruthy();
});

describe('Basic', () => {
  it('Basic promise', () => {
    const p = ContextPromise.fromPromise(
      Promise.resolve({ greeting: 'howdy' }),
    );
    return expect(p).resolves.toEqual({ greeting: 'howdy' });
  });

  it('Basic chaining', () => {
    const p = ContextPromise.fromPromise(
      Promise.resolve({ greeting: 'howdy' }),
    ).then(c => ({ greets: c.greeting }));

    return expect(p).resolves.toEqual({ greeting: 'howdy', greets: 'howdy' });
  });

  it('Raining example', () => {
    const promptZip = () => Promise.resolve('94107');
    const getTemp = (zip: string) => Promise.resolve(50);
    const getRain = (zip: string) => Promise.resolve(true);
    const shouldWearJacket = (temp: number, raining: boolean) => {
      return temp <= 50 || raining;
    };

    const p = ContextPromise.fromPromise(promptZip().then(zip => ({ zip })))
      .then(c => getTemp(c.zip).then(temp => ({ temp })))
      .then(c => getRain(c.zip).then(rain => ({ rain })))
      .then(c => ({ should: shouldWearJacket(c.temp, c.rain) }));

    return expect(p).resolves.toEqual({
      zip: '94107',
      temp: 50,
      rain: true,
      should: true,
    });
  });
});

describe('Named input', () => {
  it('Basic chaining', () => {
    const p = ContextPromise.fromPromise(Promise.resolve({ greeting: 'howdy' }))
      .then('greets', c => c.greeting)
      .then(c => console.log);

    return expect(p).resolves.toEqual({ greeting: 'howdy', greets: 'howdy' });
  });
});

describe('Bag', () => {
  it('Weather example', () => {
    const promptZip = () => Promise.resolve('94107');
    const getTemp = (zip: string) => {
      return new Promise<number>((resolve, reject) => {
        setTimeout(() => resolve(50), 10);
      });
    };
    const getRain = (zip: string) => Promise.resolve(true);
    const shouldWearJacket = (temp: number, raining: boolean) => {
      return temp <= 50 && raining;
    };

    const p = ContextPromise.fromPromise(promptZip().then(zip => ({ zip })))
      .then(c => ({
        temp: getTemp(c.zip),
        rain: getRain(c.zip),
      }))
      .then(c => ({
        should: shouldWearJacket(c.temp, c.rain),
      }));

    return expect(p).resolves.toEqual({
      zip: '94107',
      temp: 50,
      rain: true,
      should: true,
    });
  });

  it('Slightly more complex example', () => {
    const getTemp = (zip: string) => {
      return new Promise<{ temperature: number }>((resolve, reject) => {
        setTimeout(() => resolve({ temperature: 50 }), 100);
      });
    };

    const p = ContextPromise.fromPromise(
      getTemp('94107').then(temp => ({ tempResponse: temp })),
    );

    return expect(p).resolves.toEqual({
      tempResponse: {
        temperature: 50,
      },
    });
  });
});
