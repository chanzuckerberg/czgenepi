import React, {useEffect} from "react";
import Slider from "react-slick";
import Quote from "./components/Quote";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
    QuoteSliderContainer
} from "./style";

export default function QuoteSlider(): JSX.Element {

    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false
    };

    return (
        <QuoteSliderContainer>
            <Slider {...settings}>
                <Quote 
                    quoteText='We could see that our efforts, in terms of isolating the sick and quarantining exposed contacts, we could actually see that that was effective intervention. It was a headache to contain all those individuals from that superspreader event, but it worked. And this information was really useful to demonstrate to our director, to our health officers, that ... it showed the value in this 
                    [sequencing] technology."'
                    citation="—County Public Health Laboratory Director"
                    />
                <Quote 
                    quoteText='We could see that our efforts, in terms of isolating the sick and quarantining exposed contacts, we could actually see that that was effective intervention. It was a headache to contain all those individuals from that superspreader event, but it worked. And this information was really useful to demonstrate to our director, to our health officers, that ... it showed the value in this 
                    [sequencing] technology."'
                    citation="—County Public Health Laboratory Director"
                    />
            </Slider>
        </QuoteSliderContainer>
    );
}