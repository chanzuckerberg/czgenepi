import { faker } from '@faker-js/faker';

const defaultSequence = "ATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTC";
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
        const collectionDate = collection_date !== undefined ? collection_date : SampleUtil.getPastDate(10);

        return {
            pathogen_genome: {
                sequence: sequence !== undefined ? sequence : defaultSequence,
                sequencing_date: sequencing_date !== undefined ? sequencing_date : SampleUtil.getPastDate(10, collectionDate),
            },
            sample: {
                collection_date: collectionDate,
                location_id: location_id !== undefined ? location_id : locationId,
                private: privateSample !== undefined ? privateSample : false,
                private_identifier: private_identifier !== undefined ? private_identifier : SampleUtil.getSampleId(),
                public_identifier: public_identifier !== undefined ? public_identifier : SampleUtil.getSampleId(),
            }
        }
    }

    public static getSampleId(country?: string, privateId?: boolean) {
        if(privateId){
            const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let randomString = "";
            for (let i = 0; i <= 20; i++) {
                let randomPos = Math.floor(Math.random() * charSet.length);
                randomString += charSet.substring(randomPos, randomPos + 1);
            }
            return randomString;
        }else{
            const prefix = "hCoV-19";
            const _country = country !== undefined ? country : faker.address.country;
            const _number = faker.datatype.number({
                min: 10000,
                max: 99999
            });
            const year = new Date().getFullYear();

            return `${prefix}/${_country}/QA-${_number}/${year}`; 
        }
    }

    public static getPastDate(howRecent?: number, refDate?: string): string {
        const days = howRecent !== undefined ? howRecent : faker.datatype.number({
            min: 1,
            max: 10
        });
        if(refDate !== undefined){
            return faker.date.recent(days, refDate).toISOString().substring(0, 10);
        }else{
            return faker.date.recent(days).toISOString().substring(0, 10);
        }
    }
}

export interface SampleData {
    pathogen_genome: {
        sequence: string;
        sequencing_date: string;
    },
    sample: {
        collection_date: string,
        location_id: number,
        private: boolean,
        private_identifier: string,
        public_identifier: string
    }
}