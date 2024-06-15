class Tele2Ats2File {
  #filename;
  #octetstream;

  /**
   * @param { string } filename
   * @param { import('stream').Readable } octetstream
   */
  constructor(filename, octetstream) {
    this.#filename = filename;
    this.#octetstream = octetstream;
  }

  get filename() {
    return this.#filename;
  }

  get octetstream() {
    return this.#octetstream;
  }

  /**
   * @returns { Promise<Buffer> }
   */
  async toBuffer() {
    const chunks = [];

    this.#octetstream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    return new Promise((resolve, reject) => {
      this.#octetstream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
      this.#octetstream.on("error", reject);
    });
  }
}

module.exports = Tele2Ats2File;
