import React from "react";
import {
    Citation,
    QuoteContainer,
    QuoteText
} from "./style";

export default function Quote(props): JSX.Element {

    return (
        <QuoteContainer>
            <QuoteText>
                {props.quoteText}
            </QuoteText>
            <Citation>
                {props.citation}
            </Citation>
        </QuoteContainer>
    );
}