import QuoteIconImg from "src/common/images/quote-icon.svg";
import { Citation, QuoteContainer, QuoteIcon, QuoteText } from "./style";

export default function Quote(props: {
  quoteText: string;
  citation: string;
}): JSX.Element {
  return (
    <QuoteContainer>
      <QuoteIcon>
        <QuoteIconImg title="quote" />
      </QuoteIcon>
      <QuoteText>{props.quoteText}</QuoteText>
      <Citation aria-label={`citation ${props.citation}`}>
        {props.citation}
      </Citation>
    </QuoteContainer>
  );
}
