import { faker } from "@faker-js/faker";

const defaultSequence =
  "ATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTC";
const locationId = 166768;
export default abstract class SampleUtil {
  public static generateSampleData(
    sequence?: string,
    sequencing_date?: string,
    collection_date?: string,
    location_id?: number,
    privateSample?: boolean,
    private_identifier?: string,
    public_identifier?: string
  ): SampleData {
    const collectionDate =
      collection_date !== undefined
        ? collection_date
        : SampleUtil.getPastDate(10);

    return {
      pathogen_genome: {
        sequence: sequence !== undefined ? sequence : defaultSequence,
        sequencing_date:
          sequencing_date !== undefined
            ? sequencing_date
            : SampleUtil.getPastDate(10, collectionDate),
      },
      sample: {
        collection_date: collectionDate,
        location_id: location_id !== undefined ? location_id : locationId,
        private: privateSample !== undefined ? privateSample : false,
        private_identifier:
          private_identifier !== undefined
            ? private_identifier
            : SampleUtil.getSampleId(),
        public_identifier:
          public_identifier !== undefined
            ? public_identifier
            : SampleUtil.getSampleId(),
      },
    };
  }

  public static getSampleId(country?: string, privateId?: boolean) {
    if (privateId) {
      const charSet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let randomString = "";
      for (let i = 0; i <= 20; i++) {
        let randomPos = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPos, randomPos + 1);
      }
      return randomString;
    } else {
      const prefix = "hCoV-19";
      const _country = country !== undefined ? country : faker.address.country;
      const _number = faker.datatype.number({
        min: 10000,
        max: 99999,
      });
      const year = new Date().getFullYear();

      return `${prefix}/${_country}/QA-${_number}/${year}`;
    }
  }

  public static getPastDate(howRecent?: number, refDate?: string): string {
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

  public static getUserGroup(): string {
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

export interface SampleData {
  pathogen_genome: {
    sequence: string;
    sequencing_date: string;
  };
  sample: {
    collection_date: string;
    location_id: number;
    private: boolean;
    private_identifier: string;
    public_identifier: string;
  };
}

export interface UserDetails {
  id: number;
  name: string;
  agreed_to_tos: boolean;
  acknowledged_policy_version: string;
  group_admin: boolean;
  split_id: string;
  analytics_id: string;
  gisaid_submitter_id: string;
  group: {
    id: number;
    name: string;
  };
  groups: [
    {
      id: number;
      name: string;
      roles: Array<string>;
    }
  ];
}

/*
Request URL: https://api.staging.czgenepi.org/v2/users/me
Request Method: GET


Request URL: https://api.staging.czgenepi.org/v2/groups/74/
Request Method: GET

{"id":74,"name":"QA Automation","address":"123 main st.","prefix":"QA","default_tree_location":{"id":13091,"region":"North America","country":"USA","division":"California","location":"Alameda County"},"submitting_lab":"QA Automation"}


https://api.staging.czgenepi.org/v2/orgs/74/samples/

{"samples":[{"id":18218,"collection_date":"2022-08-01","collection_location":{"id":168103,"region":"Asia","country":"United Arab Emirates","division":"Dubai","location":null},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":null,"lineage":null,"confidence":null,"version":null,"scorpio_call":null,"scorpio_support":null,"qc_status":null},"private":false,"private_identifier":"MAYA-private_identifier_4","public_identifier":"hCoV-19/United Arab Emirates/QA-18218/2022","sequencing_date":"2022-08-10","submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":104,"name":"cmoga@contractor.chanzuckerberg.com"},"upload_date":"2022-08-19T09:38:52+00:00"},{"id":18219,"collection_date":"2022-08-01","collection_location":{"id":168103,"region":"Asia","country":"United Arab Emirates","division":"Dubai","location":null},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":null,"lineage":null,"confidence":null,"version":null,"scorpio_call":null,"scorpio_support":null,"qc_status":null},"private":false,"private_identifier":"MAYA-private_identifier_5","public_identifier":"hCoV-19/United Arab Emirates/QA-18219/2022","sequencing_date":"2022-08-10","submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":104,"name":"cmoga@contractor.chanzuckerberg.com"},"upload_date":"2022-08-19T09:38:52+00:00"}]}
*/
