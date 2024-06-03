class AbstractTokenStore {
  /**
   * @returns { Promise<{ accessToken?: string, refreshToken: string }> }
   */
  async loadTokens() {
    throw new Error("AbstractTokenStore.loadRefreshToken");
  }

  /**
   * @param { object } props
   * @param { string } props.accessToken
   * @param { string } props.refreshToken
   * @returns { Promise<void> }
   */
  async saveTokens({ accessToken, refreshToken }) {
    throw new Error("AbstractTokenStore.saveTokens");
  }
}

module.exports = AbstractTokenStore;
