import React, { FunctionComponent } from "react";
import { Search, Table } from "semantic-ui-react";

import { ReactComponent as SampleIcon } from "common/icons/Sample.svg";

import style from "./index.module.scss";

type Props = {
    data?: Array<Sample>;
};

interface Headers {
    text: string;
    key: keyof Sample;
}

const TABLE_HEADERS: Array<Headers> = [
    { text: "Private ID", key: "privateId" },
    { text: "Public ID", key: "publicId" },
    { text: "Upload Date", key: "uploadDate" },
    { text: "Collection Date", key: "collectionDate" },
    { text: "Collection Location", key: "collectionLocation" },
    { text: "GISAID", key: "gisaid" },
];

const UNDEFINED_TEXT = "---";

const dummySamples: Array<Sample> = [
    {
        privateId: "0865-0004KGK00-001",
        publicId: "0909EEEE-55-33",
        uploadDate: "2/1/2021",
        collectionDate: "12/12/2020",
        collectionLocation: "Santa Clara County",
        gisaid: "Accepted",
    },
    {
        privateId: "0865-0004KGK00-002",
        publicId: "0909EEEE-55-34",
        uploadDate: "2/1/2021",
        collectionDate: "12/12/2020",
        collectionLocation: "Santa Clara County",
        gisaid: "Accepted",
    },
];

const Samples: FunctionComponent<Props> = ({ data = dummySamples }: Props) => {
    const headerRow = TABLE_HEADERS.map((column) => (
        <Table.HeaderCell key={column.key}>
            <div className={style.headerCell}>{column.text}</div>
        </Table.HeaderCell>
    ));

    const sampleRow = (sample: Sample): Array<JSX.Element> => {
        return TABLE_HEADERS.map((column, index) => {
            let displayData = sample[column.key];
            let icon: JSX.Element | null = null;
            if (displayData === undefined) {
                displayData = UNDEFINED_TEXT;
            }
            if (index === 0) {
                icon = <SampleIcon className={style.icon} />;
            }
            return (
                <Table.Cell key={`${sample.privateId}-${column.key}`}>
                    <div className={style.cell}>
                        {icon}
                        {displayData}
                    </div>
                </Table.Cell>
            );
        });
    };

    const tableRows = (samples: Array<Sample>): Array<JSX.Element> => {
        return samples.map((sample) => (
            <Table.Row key={sample.privateId}>{sampleRow(sample)}</Table.Row>
        ));
    };

    return (
        <div className={style.samplesRoot}>
            <div className={style.searchBar}>
                <Search defaultValue={"Search"} />
            </div>
            <div className={style.samplesTable}>
                <Table basic="very">
                    <Table.Header className={style.header}>
                        <Table.Row>{headerRow}</Table.Row>
                    </Table.Header>
                    <Table.Body>{tableRows(data)}</Table.Body>
                </Table>
            </div>
        </div>
    );
};

export default Samples;
