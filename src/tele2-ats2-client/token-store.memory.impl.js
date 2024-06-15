const AbstractTokenStore = require("./token-store.abstract.js");

/**
 * Хранит токены в памяти (хорошо для тестов)
 */
class MemoryTokenStore extends AbstractTokenStore {
  #accessToken;
  #refreshToken;

  /**
   * @param { object } props
   * @param { string } props.refreshToken
   * @param { string } [props.accessToken]
   */
  constructor(props) {
    super();

    this.#accessToken = props.accessToken ?? null;
    this.#refreshToken = props.refreshToken;
  }

  /**
   * @returns { Promise<{ accessToken?: string, refreshToken: string }>}
   */
  async loadAccessToken() {
    return { accessToken: this.#accessToken };
  }

  /**
   * @returns { Promise<{ accessToken?: string, refreshToken: string }>}
   */
  async loadRefreshToken() {
    return { refreshToken: this.#refreshToken };
  }

  async saveTokens({ accessToken, refreshToken }) {
    this.#accessToken = accessToken;
    this.#refreshToken = refreshToken;
  }
}

module.exports = MemoryTokenStore;
