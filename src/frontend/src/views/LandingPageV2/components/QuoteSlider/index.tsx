import React from "react";
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
                    quoteText="I'm a quote!" 
                    citation="—I'm an author."
                    />
                <Quote 
                    quoteText="I'm another quote!" 
                    citation="—I'm another author."
                    />
            </Slider>
        </QuoteSliderContainer>
    );
}