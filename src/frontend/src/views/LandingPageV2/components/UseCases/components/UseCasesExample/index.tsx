import React from "react";
import {
    UseCasesExampleContainer,
    UseCasesExampleHeadline,
} from "./style";

export default function UseCasesExample(props: { headline: string; }): JSX.Element {

    return (
        <UseCasesExampleContainer>
            <UseCasesExampleHeadline>
                {props.headline}
            </UseCasesExampleHeadline>
        </UseCasesExampleContainer>
    );
}