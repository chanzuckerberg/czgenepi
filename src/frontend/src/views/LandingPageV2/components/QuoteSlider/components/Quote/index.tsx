import QuoteIconImg from "src/common/images/quote-icon.svg";
import { Citation, QuoteContainer, QuoteIcon, QuoteText } from "./style";

export default function Quote(props: {
  quoteText: string;
  citation: string;
}): JSX.Element {
  return (
    <QuoteContainer>
      <QuoteIcon>
        <QuoteIconImg />
      </QuoteIcon>
      <QuoteText>{props.quoteText}</QuoteText>
      <Citation>{props.citation}</Citation>
    </QuoteContainer>
  );
}
