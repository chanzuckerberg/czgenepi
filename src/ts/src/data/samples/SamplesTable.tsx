import React, { FunctionComponent } from "react";
import { Table } from "semantic-ui-react";

import { ReactComponent as SampleIcon } from "common/icons/Sample.svg";

import style from "./index.module.scss";

interface Props {
    data?: Array<Sample>;
};

interface Header {
    text: string;
    key: keyof Sample;
}

const TABLE_HEADERS: Array<Header> = [
    { text: "Private ID", key: "privateId" },
    { text: "Public ID", key: "publicId" },
    { text: "Upload Date", key: "uploadDate" },
    { text: "Collection Date", key: "collectionDate" },
    { text: "Collection Location", key: "collectionLocation" },
    { text: "GISAID", key: "gisaid" },
];

const UNDEFINED_TEXT = "---";

const SamplesTable: FunctionComponent<Props> = ({ data = [] }: Props) => {
    // render functions
    const headerRow = TABLE_HEADERS.map((column: Header) => (
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
        <Table basic="very">
            <Table.Header className={style.header}>
                <Table.Row>{headerRow}</Table.Row>
            </Table.Header>
            <Table.Body>{tableRows(data)}</Table.Body>
        </Table>
    )
}

export default SamplesTable;
