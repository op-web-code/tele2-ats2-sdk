class AbstractProxyStore {
  /**
   * @returns { Promise<void | { proxy?: import('../../types').ProxyHttp }> }
   */
  async loadProxy() {
    throw new Error("AbstractProxyStore.loadProxy");
  }
}

module.exports = AbstractProxyStore;
