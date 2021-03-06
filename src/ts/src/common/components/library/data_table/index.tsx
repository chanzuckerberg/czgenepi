import React, { FunctionComponent } from "react";
import { Table } from "semantic-ui-react";

import { ReactComponent as SampleIcon } from "common/icons/Sample.svg";

import style from "./index.module.scss";

interface Props {
    data?: BioinformaticsType[];
    headers: Header[];
}

const ICONS: Record<string, JSX.Element> = {
    Sample: <SampleIcon className={style.icon} />,
    Tree: <span />,
};

const UNDEFINED_TEXT = "---";

const DataTable: FunctionComponent<Props> = ({ data = [], headers }: Props) => {
    const indexingKey = headers[0].key;

    // render functions
    const headerRow = headers.map((column: Header) => (
        <Table.HeaderCell key={column.key}>
            <div className={style.headerCell}>{column.text}</div>
        </Table.HeaderCell>
    ));

    const sampleRow = (item: BioinformaticsType): Array<JSX.Element> => {
        return headers.map((column, index) => {
            let displayData: string | number | undefined = item[column.key];
            let icon: JSX.Element | null = null;
            if (displayData === undefined) {
                displayData = UNDEFINED_TEXT;
            }
            if (index === 0) {
                console.log(item.type);
                icon = ICONS[item.type];
            }
            console.log(icon);
            return (
                <Table.Cell key={`${item[indexingKey]}-${column.key}`}>
                    <div className={style.cell}>
                        {icon}
                        {displayData}
                    </div>
                </Table.Cell>
            );
        });
    };

    function tableRows(data: BioinformaticsType[]): Array<JSX.Element> {
        return data.map((item) => (
            <Table.Row key={item[indexingKey]}>{sampleRow(item)}</Table.Row>
        ));
    }

    return (
        <Table basic="very">
            <Table.Header className={style.header}>
                <Table.Row>{headerRow}</Table.Row>
            </Table.Header>
            <Table.Body>{tableRows(data)}</Table.Body>
        </Table>
    );
};

export { DataTable };
