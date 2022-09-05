import { faker } from "@faker-js/faker";

export class GeneralUtil {
  public static getValueOrDefault = function <T>(value: T, defaultValue: T): T {
    return value !== undefined ? value : defaultValue;
  };

  public static getRandomNumber(): number {
    return faker.datatype.number({
      min: 10000,
      max: 99999,
    });
  }

  public static generatePublicSampleId(country?: string): string {
    const prefix = "hCoV-19";
    const _country = country !== undefined ? country : faker.address.country();
    const _number = GeneralUtil.getRandomNumber();
    const year = new Date().getFullYear();

    return `${prefix}/${_country}/QA-${_number}/${year}`;
  }

  public static generatePrivateSampleId(): string {
    const charSet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i <= 20; i++) {
      let randomPos = Math.floor(Math.random() * charSet.length);
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
  public static getADateInThePast(
    howRecent?: number,
    refDate?: string
  ): string {
    const days =
      howRecent !== undefined
        ? howRecent
        : faker.datatype.number({
            min: 1,
            max: 10,
          });
    if (refDate !== undefined) {
      return faker.date.recent(days, refDate).toISOString().substring(0, 10);
    } else {
      return faker.date.recent(days).toISOString().substring(0, 10);
    }
  }
}
