const AbstractTokenStore = require("./token-store.abstract.js");
const fs = require("fs/promises");

const DEFAULT_FILENAME = ".tele2ats2.token.json";

/**
 * Хранит токены файлы (хорошо для монолита)
 */
class FileTokenStore extends AbstractTokenStore {
  #filename;
  #refreshToken;

  /**
   * @param { object } [props]
   * @param { string } [props.filename]
   * @param { string } [props.refreshToken]
   */
  constructor(props) {
    super();

    this.#filename = props?.filename ?? DEFAULT_FILENAME;
    this.#refreshToken = props?.refreshToken ?? null;
  }

  /**
   * @returns { Promise<{ accessToken?: string, refreshToken: string }>}
   */
  async loadAccessToken() {
    const content = await fs.readFile(this.#filename, "utf8");
    const { accessToken, startRefreshToken } = JSON.parse(content);

    if (this.#refreshToken && startRefreshToken !== this.#refreshToken) {
      return { accessToken: null };
    }

    return { accessToken };
  }

  /**
   * @returns { Promise<{ accessToken?: string, refreshToken: string }>}
   */
  async loadRefreshToken() {
    try {
      const content = await fs.readFile(this.#filename, "utf8");
      const { refreshToken, startRefreshToken } = JSON.parse(content);

      if (this.#refreshToken && startRefreshToken !== this.#refreshToken) {
        return { refreshToken: this.#refreshToken };
      }

      return { refreshToken };
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
      if (!this.#refreshToken) {
        throw new Error("No refresh token provided");
      }
      return { refreshToken: this.#refreshToken };
    }
  }

  async saveTokens({ accessToken, refreshToken }) {
    await fs.writeFile(
      this.#filename,
      JSON.stringify(
        {
          accessToken,
          refreshToken,
          startRefreshToken: this.#refreshToken ?? null,
        },
        null,
        2
      )
    );
  }
}

module.exports = FileTokenStore;
