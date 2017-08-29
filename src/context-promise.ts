export type PromiseBag<Result> = {
  [k in keyof Result]: Result[k] | PromiseLike<Result[k]>
};

function isPromiseBag<T>(obj: any): obj is PromiseBag<T> {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
  return Object.getPrototypeOf(obj) === Object.prototype;
}

class ContextPromise<C = {}, U = {}> implements PromiseLike<C & U> {
  contextProvider: PromiseLike<C>;

  constructor(value: C | PromiseLike<C>) {
    this.contextProvider = Promise.resolve(value);
  }

  /** Named */
  then<K extends string, TResult1 = U, TResult2 = never>(
    key: K,
    onfulfilled: ((value: C) => TResult1 | PromiseLike<TResult1>),
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & { [k in K]: TResult1 }>;

  /** Bag or basic */
  then<TResult1 = U, TResult2 = never>(
    onfulfilled: (value: C) => PromiseBag<TResult1> | PromiseLike<TResult1>,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & TResult1>;

  then(A?: any, B?: any, C?: any): any {
    if (typeof A === 'string') {
      return this.keyedThen(A, B, C);
    } else {
      return this.realThen(A, B);
    }
  }

  tap(onfulfilled: (value: C) => void): ContextPromise<C> {
    return new ContextPromise(new Promise((resolve, reject) => {
      this.contextProvider.then((c: C) => {
        try {
          onfulfilled(c);
        } catch (e) {
          reject(c);
          return;
        }
        resolve(c);
      }, reject);
    }));
  }

  private realThen<TResult1 = U, TResult2 = never>(
    onfulfilled: (value: C) => PromiseBag<TResult1> | PromiseLike<TResult1>,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & TResult1> {
    return new ContextPromise(
      new Promise((resolve, reject) => {
        this.contextProvider.then((c: C) => {
          const contextualResults = onfulfilled(c);
          if (isPromiseBag<TResult1>(contextualResults)) {
            const transformed = Object.keys(contextualResults).map(k => {
              return Promise.resolve(contextualResults[k]).then(tk => ({
                [k]: tk,
              }));
            });

            Promise.all(transformed)
              .then(values => {
                resolve(Object.assign.apply(null, [{}, c, ...values]));
              })
              .catch(reject);
          } else {
            Promise.resolve(contextualResults)
              .then(value => resolve(Object.assign({}, c, value)))
              .catch(reject);
          }
        });
      }),
    );
  }

  private keyedThen<K extends string, TResult1 = U, TResult2 = never>(
    key: K,
    onfulfilled: ((value: C) => TResult1 | PromiseLike<TResult1>),
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & { [k in K]: TResult1 }> {
    return new ContextPromise(
      new Promise((resolve, reject) => {
        this.contextProvider.then((c: C) => {
          Promise.resolve(onfulfilled(c))
            .then((u: TResult1) => {
              resolve(Object.assign({}, c, { [key]: u }));
            })
            .catch(reject);
        }, reject);
      }),
    );
  }
}

export { ContextPromise };
