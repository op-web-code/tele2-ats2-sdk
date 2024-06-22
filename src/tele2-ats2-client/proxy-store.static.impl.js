const AbstractProxyStore = require("./proxy-store.abstract");

class StaticProxyStore extends AbstractProxyStore {
  #proxy;

  /**
   * @param { import('../../types').ProxyHttp } [proxy]
   */
  constructor(proxy) {
    super();
    this.#proxy = proxy;
  }

  /**
   * @returns { Promise<void | { proxy?: import('../../types').ProxyHttp }> }
   */
  async loadProxy() {
    if (!this.#proxy) {
      return null;
    }

    return {
      proxy: {
        ...this.#proxy,
      },
    };
  }
}

module.exports = StaticProxyStore;
