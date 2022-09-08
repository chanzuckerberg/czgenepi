import { TreeInfo } from "../utils/schemas/treeInfo";
import { faker } from "@faker-js/faker";
import { sample } from "lodash";

export abstract class MockData {
  /**
   * Method generates data for testing treeInfo. Parameter is optional but we need to supply valid sample IDs to be forced if needed.
   * @param collectionDateType - period, onlyFrom, onlyTo, fromAndTo
   * @param defaults - user specified tree info data
   * @returns TreeInfo
   */
  public static generateTreeData(
    collectionDateType = "period",
    defaults?: Partial<TreeInfo>
  ): TreeInfo {
    const treeTypes = ["Overview", "Targeted", "Non contextualized"];
    const periods = [
      "Last 7 Days",
      "Last 30 Days",
      "Last 3 Months",
      "Last 6 Months",
      "Last Year",
    ];
    const lineages = ["A", "BA.1.1", "BA.1.15"]; // this should be centralized
    const dateFrom = MockData.getADateInThePast();
    const dateTo = MockData.getADateInThePast(5, dateFrom);
    let treeInfo: TreeInfo = {
      treeName: MockData.getValueOrDefault(
        defaults?.treeName,
        faker.datatype.string(10)
      ) as string,
      treeType: MockData.getValueOrDefault(
        defaults?.treeType,
        sample(treeTypes)
      ) as string,
      lineage: MockData.getValueOrDefault(
        defaults?.lineage,
        lineages
      ) as Array<string>,
    };
    if (collectionDateType === "from") {
      treeInfo["collectionDate"] = {
        from: MockData.getValueOrDefault(
          defaults?.collectionDate?.from,
          dateFrom
        ) as string,
      };
    } else if (collectionDateType === "to") {
      treeInfo["collectionDate"] = {
        to: MockData.getValueOrDefault(
          defaults?.collectionDate?.to,
          dateTo
        ) as string,
      };
    } else if (collectionDateType === "fromAndTo") {
      treeInfo["collectionDate"] = {
        from: MockData.getValueOrDefault(
          defaults?.collectionDate?.from,
          dateFrom
        ) as string,
        to: MockData.getValueOrDefault(
          defaults?.collectionDate?.to,
          dateTo
        ) as string,
      };
    } else if (collectionDateType === "period") {
      treeInfo["collectionDate"] = {
        custom: MockData.getValueOrDefault(
          defaults?.collectionDate?.custom,
          sample(periods)
        ) as string,
      };
    }
    return treeInfo;
  }
  public static getValueOrDefault = function <T>(value: T, defaultValue: T): T {
    return value !== undefined ? value : defaultValue;
  };

  public static getRandomNumber(): number {
    return faker.datatype.number({
      min: 10000,
      max: 99999,
    });
  }
  /*
  Sample collection and sequencing dates need to be in the past. 
  This helper method generates a date in the past so it does not need to be hard coded. 
  @param {number} howRecent: how recent the date should be, defaults to 10, meaning the date can be 1 - 10 days in the past
  @param {string} refDate: reference date to use, especially useful for sequencing date that needs to be later than collection date
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
