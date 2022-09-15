import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import Quote from "./components/Quote";
import { QuoteSliderContainer } from "./style";

export default function QuoteSlider(): JSX.Element {
  const settings = {
    arrows: false,
    dots: true,
    infinite: true,
    slidesToScroll: 1,
    slidesToShow: 1,
    speed: 800,
  };

  return (
    <QuoteSliderContainer role="region" aria-label="User Quotes">
      <Slider {...settings}>
        <Quote
          quoteText='Obtaining adequate resources in this area is a constant challenge and we would not have been able to do this otherwise. For years, we’ve watched better-resourced regions, like LA and the Bay Area, quickly bring on technological advancements that further the field. It is wonderful to finally be able to be a part of this and, through our testing for surrounding counties, support the communities in our entire region."'
          citation="—County Public Health Lab Director"
        />
        <Quote
          quoteText='We could see that our efforts, in terms of isolating the sick and quarantining exposed contacts, we could actually see that that was effective intervention..It was a headache to contain all those individuals from that superspreader event, but it worked. And this information was really useful to demonstrate to our director, to our health officers ... it showed the value in this technology."'
          citation="—Communicable Disease Investigator"
        />
      </Slider>
    </QuoteSliderContainer>
  );
}
