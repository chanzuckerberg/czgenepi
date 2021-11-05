import styled from "@emotion/styled";

export const QuoteSliderContainer = styled.div`
    padding-bottom: 100px;
    text-align: center;
    background: #511CC1;

    & .slick-dots {
        bottom: -22%;
        
        & li {
            margin: 0 -2px;
            
            & button:before {
                font-size: 10px;
                color: black;
                opacity: 0.4;
            }
            
            &.slick-active button:before {
                color: white;
                opacity: 1;
            }
        }
    }
`;