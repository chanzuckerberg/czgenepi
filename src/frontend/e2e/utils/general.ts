export class GeneralUtil {
  public static getValueOrDefault = function <T>(value: T, defaultValue: T): T {
    return value !== undefined ? value : defaultValue;
  };

  public static getRandomNumber(): number {
    return Math.floor(Math.random() * 99999) + 1;
  }

  public static generatePublicSampleId(country?: string): string {
    const prefix = "hCoV-19";
    const _country = country !== undefined ? country : "USA";
    const _number = GeneralUtil.getRandomNumber();
    const year = new Date().getFullYear();

    return `${prefix}/${_country}/QA-${_number}/${year}`;
  }

  public static generatePrivateSampleId(): string {
    const charSet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i <= 20; i++) {
      const randomPos = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPos, randomPos + 1);
    }
    return randomString;
  }

  /*
  Sample collection and sequencing dates need to be in the past. 
  This helper method generates a date in the past it does not need to be hard coded. 
  @param {number} howRecent: how recent the date should be, defaults to 10, meaning the date can be 1 - 10 days in the past
  @param {string} refDate: reference date to use, especially useful for sequencing date that needs to be older that collection date
  */
  public static getADateInThePast(earliest = 10, refDate?: string): string {
    // if current date if no refence date
    const fromDate = refDate !== undefined ? new Date(refDate) : new Date();
    let d = fromDate;
    do {
      d = fromDate;
      const randomNumber = Math.floor(Math.random() * earliest);
      d.setDate(d.getDate() - randomNumber);
    } while (d.getTime() < fromDate.getTime());
    return d.toISOString().substring(0, 10);
  }
}
