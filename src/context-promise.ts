function isPojo(obj: any): obj is { [k: string]: any } {
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

  /** Bag */
  then<TResult1 = U, TResult2 = never>(
    onfulfilled?: (
      value: C,
    ) => { [k in keyof TResult1]: PromiseLike<TResult1[k]> | TResult1[k] },
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & TResult1>;

  /** Named */
  then<K extends string, TResult1 = U, TResult2 = never>(
    key: K,
    onfulfilled?: ((value: C) => TResult1 | PromiseLike<TResult1>),
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & { [k in K]: TResult1 }>;

  then(A: any, B: any, C: any): any {
    if (typeof A === 'string') {
      return this.thenNamed(A, B, C);
    } else {
      return this.thenBag(A, B);
    }
  }

  private thenBag<TResult1 = U, TResult2 = never>(
    onfulfilled?: (
      value: C,
    ) => { [k in keyof TResult1]: PromiseLike<TResult1[k]> | TResult1[k] },
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & TResult1> {
    return new ContextPromise(
      new Promise((resolve, reject) => {
        this.contextProvider.then((c: C) => {
          const promises = onfulfilled(c);
          if (isPojo(promises)) {
            const transformed = Object.keys(promises).map(k => {
              return Promise.resolve(promises[k]).then(tk => ({ [k]: tk }));
            });

            Promise.all(transformed)
              .then(values => {
                resolve(Object.assign.apply(null, [{}, c, ...values]));
              })
              .catch(reject);
          } else {
            resolve(Object.assign({}, c));
          }
        });
      }),
    );
  }

  private thenNamed<TResult1 = U, TResult2 = never, K extends string>(
    key: K,
    onfulfilled?: ((value: C) => TResult1 | PromiseLike<TResult1>),
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>),
  ): ContextPromise<C & { [k in K]: TResult1 }> {
    return new ContextPromise(
      new Promise((resolve, reject) => {
        this.contextProvider
          .then((c: C) => {
            Promise.resolve(onfulfilled(c))
              .then((u: TResult1) => {
                resolve(Object.assign({}, c, { [key]: u }));
              })
              .catch(reject);
          })
          .catch(reject);
      }),
    );
  }
}

export { ContextPromise };
