import React, { FunctionComponent } from "react";
import { Table } from "semantic-ui-react";

import { get } from "common/utils";

import style from "./index.module.scss";

type Props = {
    data?: Array<Sample>;
};

interface Headers {
    text: string,
    key: keyof Sample
}

const TABLE_HEADERS: Array<Headers> = [
    { text: "Private ID", key: "privateID" },
    { text: "Public ID", key: "publicID" },
    { text: "Upload Date", key: "uploadDate" },
    { text: "Collection Date", key: "collectionDate" },
    { text: "Collection Location", key: "collectionLocation" },
    { text: "GISAID", key: "gisaid" },
];

const UNDEFINED_TEXT = "---"

// const dummySamples: Array<Sample> = [
//     {
//         privateId: "0865-0004KGK00-001",
//         publicId: "0909EEEE-55-33",
//         uploadDate: "2/1/2021",
//         collectionDate: "12/12/2020",
//         collectionLocation: "Santa Clara County",
//         gisaid: "Accepted",
//     },
//     {
//         privateId: "0865-0004KGK00-001",
//         publicId: "0909EEEE-55-33",
//         uploadDate: "2/1/2021",
//         collectionDate: "12/12/2020",
//         collectionLocation: "Santa Clara County",
//         gisaid: "Accepted",
//     },
// ];

const Samples: FunctionComponent<Props> = ({ data = [] }: Props) => {
    const headerRow = TABLE_HEADERS.map((column) => (
        <Table.HeaderCell key={column.key}>
            <span className={style.header}>{column.text}</span>
        </Table.HeaderCell>
    ));

    const sampleRow = (sample: Sample): Array<JSX.Element> => {
        return TABLE_HEADERS.map((column) => {
            let displayData = sample[column.key]
            if (displayData === undefined) {
                displayData = UNDEFINED_TEXT
            }
            return (
                <Table.Cell key={`${sample.privateId}-${column.key}`}>
                    {displayData}
                </Table.Cell>
            )
        });
    };

    const tableRows = (samples: Array<Sample>): Array<JSX.Element> => {
        return samples.map((sample) => (
            <Table.Row key={sample.privateId}>{sampleRow(sample)}</Table.Row>
        ));
    };

    return (
        <div className={style.samplesRoot}>
            <Table basic="very" singleline>
                <Table.Header>
                    <Table.Row>{headerRow}</Table.Row>
                </Table.Header>
                <Table.Body>{tableRows(data)}</Table.Body>
            </Table>
        </div>
    );
};

export default Samples;
