class ContextPromise<C = {}, U = {}> implements PromiseLike<C & U> {
  contextProvider: PromiseLike<C>;

  constructor(value: C | PromiseLike<C>) {
    this.contextProvider = Promise.resolve(value);
  }

  then<TResult1 = U, TResult2 = never>(
    onfulfilled?: ((value: C) => TResult1 | PromiseLike<TResult1>)
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)
  ): ContextPromise<C & TResult1> {
    return new ContextPromise(new Promise((resolve, reject) => {
      this.contextProvider
        .then((c: C) => {
          Promise.resolve(onfulfilled(c))
            .then((u: TResult1) => {
              resolve(Object.assign({}, c, u));
            })
            .catch(reject);
        })
        .catch(reject);
    }))
  }
}

export { ContextPromise };
