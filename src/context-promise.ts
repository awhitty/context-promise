export type PromiseBag<Result> = {
  [k in keyof Result]: Result[k] | PromiseLike<Result[k]>
};

function isPromiseBag<T>(obj: any): obj is PromiseBag<T> {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
  return Object.getPrototypeOf(obj) === Object.prototype;
}

class ContextPromise<C = {}> implements PromiseLike<C> {
  contextProvider: PromiseLike<C>;

  static fromPromise<C = {}>(promise: C | PromiseLike<C>): ContextPromise<C> {
    return new ContextPromise((resolve, reject) => {
      Promise.resolve(promise).then(resolve, reject);
    });
  }

  constructor(
    executor: (
      resolve: (value?: C | PromiseLike<C>) => void,
      reject: (reason?: any) => void,
    ) => void,
  ) {
    this.contextProvider = new Promise(executor);
  }

  /** Named */
  then<K extends string, TResult1, TResult2 = never>(
    key: K,
    onfulfilled: ((value: C) => TResult1 | PromiseLike<TResult1>),
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & { [k in K]: TResult1 }>;

  /** Bag or basic */
  then<TResult1, TResult2 = never>(
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
    return new ContextPromise((resolve, reject) => {
      this.contextProvider.then((c: C) => {
        try {
          onfulfilled(c);
        } catch (e) {
          reject(e);
          return;
        }
        resolve(c);
      }, reject);
    });
  }

  private realThen<TResult1, TResult2 = never>(
    onfulfilled: (value: C) => PromiseBag<TResult1> | PromiseLike<TResult1>,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & TResult1> {
    return new ContextPromise((resolve, reject) => {
      this.contextProvider.then((c: C) => {
        let contextualResults;
        try {
          contextualResults = onfulfilled(c);
        } catch (e) {
          reject(e);
          return;
        }

        if (isPromiseBag<TResult1>(contextualResults)) {
          const transformed = Object.keys(contextualResults).map(k => {
            return Promise.resolve(
              (contextualResults as PromiseBag<TResult1>)[k],
            ).then(tk => ({
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
      }, onrejected);
    });
  }

  private keyedThen<K extends string, TResult1, TResult2 = never>(
    key: K,
    onfulfilled: ((value: C) => TResult1 | PromiseLike<TResult1>),
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & { [k in K]: TResult1 }> {
    return new ContextPromise((resolve, reject) => {
      this.contextProvider.then((c: C) => {
        let contextualResults;
        try {
          contextualResults = onfulfilled(c);
        } catch (e) {
          reject(e);
          return;
        }

        Promise.resolve(contextualResults)
          .then((u: TResult1) => {
            // :KLUDGE: This function's type annotations rely on this one
            // :weird trick (`K extends string`). The `as any`s are here to
            // :quiet the compiler.
            resolve(Object.assign({}, c, { [key as any]: u } as any));
          })
          .catch(reject);
      }, onrejected);
    });
  }
}

export { ContextPromise };
