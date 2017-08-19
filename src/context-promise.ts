class ContextPromise<U> implements PromiseLike<U> {
  context: U;

  constructor(bag: U) {
    this.context = Object.assign({}, bag);
  }

  then<T, K extends string>(
    key: K,
    p: (u: U) => PromiseLike<T> | T,
  ): ContextPromise<{[k in K]: T} & U>;

  then<T>(
    p: (u: U) => PromiseLike<T> | T,
  ): ContextPromise<U & T>;

  then<T>(
    p: (u: U) => { [k in keyof T]: PromiseLike<T[k]> | T[k] },
  ): ContextPromise<U & T>;

  then(A: any, B?: any): any {

  }

  private thenMultiPromise<T>(
    promises: { [k in keyof T]: PromiseLike<T[k]> },
  ): ContextPromise<T & U> {
    return Promise.all(Object.keys(promises).map(k => {
      return promises[k]
        .then(t => ({ [k]: t }))
    })).then(values => {
      return new ContextPromise(Object.assign.apply(null, [{}, this.context, ...values]));
    }) as any as ContextPromise<T & U>;
  }

  private thenNamedPromise<T, K extends string>(
    key: K,
    p: (u: U) => PromiseLike<T> | T
  ): ContextPromise<{[k in K]: T} & U> {
    console.log('yo')
    return Promise.resolve(p(this.context))
      .then((t: T) => {
        return new ContextPromise(Object.assign({}, this.context, {
          [key as string]: t
        }));
      }) as any as ContextPromise<{[k in K]: T} & U>;
  }

  private thenSinglePromise<T>(
    results: PromiseLike<T> | T
  ): ContextPromise<T & U> {
    console.log('should happen once')
    return Promise.resolve(results)
      .then((t: T) => {
        return new ContextPromise(Object.assign({}, this.context, t));
      }) as any as ContextPromise<T & U>;
  }
}

export { ContextPromise };
