import { ContextPromise } from './context-promise';

it('ContextPromise is defined', () => {
  expect(ContextPromise).toBeTruthy();
});

// it('Full context is passed to promise', () => {
//   const context = {
//     a: 123,
//     b: 'howdy!',
//     c: () => 'yo',
//   };

//   new ContextPromise(context)
//     .then(c => {
//       expect(c).toEqual(context);
//       expect(c).not.toBe(context);
//     })
// })

it.only('dev', () => {
  const promptZip = () => Promise.resolve({ zip: 12345 });
  // const getTemperature = (zip: number) => Promise.resolve(30);
  // const getRainy = (zip: number) => Promise.resolve(true);

  new ContextPromise({})
    .then(c => promptZip())
    .then(c => console.log(c))
    .then(c => console.log('again', c))
})
