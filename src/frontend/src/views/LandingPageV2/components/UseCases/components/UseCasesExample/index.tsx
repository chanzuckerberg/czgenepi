import React from "react";
import {
    UseCasesExampleContainer,
    UseCasesExampleHeadline,
    UseCasesExampleCopy
} from "./style";

export default function UseCasesExample(props): JSX.Element {

    return (
        <UseCasesExampleContainer>
            <UseCasesExampleHeadline>
                {props.headline}
            </UseCasesExampleHeadline>
            <UseCasesExampleCopy>
                {props.copy}
            </UseCasesExampleCopy>
        </UseCasesExampleContainer>
    );
}