import React, { FunctionComponent } from "react";
import { Table } from "semantic-ui-react";

import style from "./index.module.scss";

type Props = {
    data?: Array<Sample>;
};

const TABLE_HEADERS: Array<Record<string, string>> = [
    { text: "Private ID", key: "privateId" },
    { text: "Public ID", key: "publicId" },
    { text: "Upload Date", key: "uploadDate" },
    { text: "Collection Date", key: "collectionDate" },
    { text: "Collection Location", key: "collectionLocation" },
    { text: "GISAID", key: "gisaid" },
];

const dummySamples: Array<Sample> = [
    {
        id: 1,
        privateId: "0865-0004KGK00-001",
        publicId: "0909EEEE-55-33",
        uploadDate: "2/1/2021",
        collectionDate: "12/12/2020",
        collectionLocation: "Santa Clara County",
        gisaid: "Accepted",
    },
    {
        id: 2,
        privateId: "0865-0004KGK00-001",
        publicId: "0909EEEE-55-33",
        uploadDate: "2/1/2021",
        collectionDate: "12/12/2020",
        collectionLocation: "Santa Clara County",
        gisaid: "Accepted",
    },
];

const Samples: FunctionComponent<Props> = ({ data = dummySamples }: Props) => {
    const headerRow = TABLE_HEADERS.map((column) => (
        <Table.HeaderCell key={column.key}>
            <span className={style.header}>{column.text}</span>
        </Table.HeaderCell>
    ));

    const sampleRow = (sample: Sample): Array<JSX.Element> => {
        return TABLE_HEADERS.map((column) => (
            <Table.Cell key={`${sample.privateId}-${column.key}`}>
                {sample[column.key as keyof Sample]}
            </Table.Cell>
        ));
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
