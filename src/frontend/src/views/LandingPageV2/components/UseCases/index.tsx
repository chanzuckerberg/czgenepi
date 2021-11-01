import React from "react";
import UseCasesImg from "src/common/images/landingv2-use-cases.png";
import {
    Header,
    UseCasesContainer,
    UseCasesImage
} from "./style";

export default function UseCases(): JSX.Element {

    return (
        <UseCasesContainer>
            <UseCasesImage src={UseCasesImg} />
        </UseCasesContainer>
    );
}