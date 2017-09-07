import { ContextPromise } from './context-promise';

describe('ContextPromise', () => {
  it('ContextPromise is defined', () => {
    expect(ContextPromise).toBeTruthy();
  });

  describe('constructor', () => {
    it('constructs a ContextPromise object', () => {
      const cp = new ContextPromise((resolve, reject) => {
        resolve({ greeting: 'Hi' });
      });

      expect(cp).toBeInstanceOf(ContextPromise);
    });

    it('rejects properly', () => {
      const cp = new ContextPromise((resolve, reject) => {
        throw Error;
      });

      expect(cp).rejects.toBe(Error);
    });
  });

  describe('fromPromise', () => {
    it('constructs a ContextPromise object', () => {
      const cp = ContextPromise.fromPromise(
        Promise.resolve({ greeting: 'Hi' }),
      );
      expect(cp).toBeInstanceOf(ContextPromise);
    });

    it('resolves to the value of the promise', () => {
      const cp = ContextPromise.fromPromise(
        Promise.resolve({ greeting: 'Hi' }),
      );
      expect(cp).resolves.toEqual({ greeting: 'Hi' });
    });
  });

  describe('fromBag', () => {
    it('constructs a ContextPromise object', () => {
      const cp = ContextPromise.fromBag({
        greeting: Promise.resolve('hi'),
      });

      expect(cp).toBeInstanceOf(ContextPromise);
    });

    it('resolves the contents of the bag', () => {
      const cp = ContextPromise.fromBag({
        greeting: Promise.resolve('hi'),
        name: 'Gert',
      });

      expect(cp).resolves.toEqual({
        greeting: 'hi',
        name: 'Gert',
      });
    });
  });

  describe('then', () => {
    describe('Unnamed', () => {
      it('provides context to chain', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        }).then(c => {
          expect(c).toEqual({ name: 'Gert' });
          done();
        });
      });

      it('provides context to double chain', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        })
          .then(c => {
            return {
              greeting: `Hi, ${c.name}`,
            };
          })
          .then(c => {
            expect(c).toEqual({
              name: 'Gert',
              greeting: 'Hi, Gert',
            });
            done();
          });
      });

      it('resolves promises', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        })
          .then(c => Promise.resolve({ greeting: `Hi, ${c.name}` }))
          .then(c => {
            expect(c).toEqual({
              name: 'Gert',
              greeting: 'Hi, Gert',
            });
            done();
          });
      });

      it('resolves promises in a bag', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        })
          .then(c => {
            return {
              greeting: Promise.resolve(`Hi, ${c.name}`),
            };
          })
          .then(c => {
            expect(c).toEqual({
              name: 'Gert',
              greeting: 'Hi, Gert',
            });
            done();
          });
      });

      it('rejects when error in fulfilled handler', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        })
          .then(c => {
            throw Error;
          })
          .then(
            c => {},
            e => {
              expect(e).toBe(Error);
              done();
            },
          );
      });

      it('rejects when sub-promise rejects', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        })
          .then(c => Promise.reject(Error))
          .then(
            c => {},
            e => {
              expect(e).toBe(Error);
              done();
            },
          );
      });

      it('rejects when sub-promise in bag rejects', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        })
          .then(c => {
            return {
              greeting: Promise.reject(Error),
            };
          })
          .then(
            c => {},
            e => {
              expect(e).toBe(Error);
              done();
            },
          );
      });
    });

    describe('Named', () => {
      it('accepts named payload', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        })
          .then('greeting', c => `Hi, ${c.name}`)
          .then(c => {
            expect(c).toEqual({
              name: 'Gert',
              greeting: 'Hi, Gert',
            });
            done();
          });
      });

      it('resolves promises from named payload', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        })
          .then('greeting', c => Promise.resolve(`Hi, ${c.name}`))
          .then(c => {
            expect(c).toEqual({
              name: 'Gert',
              greeting: 'Hi, Gert',
            });
            done();
          });
      });

      it('resolves context even when intermediate returns undefined', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        })
          .then(c => {
            return;
          })
          .then('greeting', c => `Hi, ${c.name}`)
          .then(c => {
            expect(c).toEqual({
              name: 'Gert',
              greeting: 'Hi, Gert',
            });
            done();
          });
      });

      it('rejects when error in named fulfilled handler', done => {
        ContextPromise.fromBag({
          name: Promise.resolve('Gert'),
        })
          .then('greeting', c => {
            throw Error;
          })
          .then(
            c => {},
            e => {
              expect(e).toBe(Error);
              done();
            },
          );
      });
    });
  });

  describe('toPromise', () => {
    it('returns a promise', () => {
      const promise = ContextPromise.fromBag({
        name: Promise.resolve('Gert'),
      }).toPromise();

      expect(promise).toBeInstanceOf(Promise);
      expect(promise).not.toBeInstanceOf(ContextPromise);
    });

    it('resolves to the original context', done => {
      ContextPromise.fromBag({
        name: Promise.resolve('Gert'),
      })
        .then('greeting', c => `Hi, ${c.name}`)
        .toPromise()
        .then(c => {
          expect(c).toEqual({
            name: 'Gert',
            greeting: 'Hi, Gert',
          });
          done();
        });
    });
  });
});
