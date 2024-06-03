class Tele2Ats2File {
  /**
   * @param { import('stream').Readable } octetstream
   */
  constructor(octetstream) {
    this.octetstream = octetstream;
  }

  /**
   * @returns { Promise<Buffer> }
   */
  async toBuffer() {
    const chunks = [];

    this.octetstream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    return new Promise((resolve, reject) => {
      this.octetstream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
      this.octetstream.on("error", reject);
    });
  }
}

module.exports = Tele2Ats2File;
