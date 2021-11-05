import React from "react";
import ComputerImg from "src/common/images/landingv2-computer.png";
import {
    IntroContainer,
    IntroCTAButton,
    IntroDescription,
    IntroHeading,
    IntroImage,
    IntroTextContainer
} from "./style";

export default function IntroSection(): JSX.Element {

    return (
        <IntroContainer>
            <IntroImage>
                <img style={{maxWidth: "797px", width: "100%", height: "auto"}} src={ComputerImg} alt="" />
            </IntroImage>
            <IntroTextContainer>
                <IntroHeading>
                    Manage, analyze, and share your pathogen data for genomic epidemiology
                </IntroHeading>
                <IntroDescription>
                    Maecenas sed diam eget risus varius blandit sit amet non magna. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                </IntroDescription>
                <IntroCTAButton href="/">
                    See It in Action
                </IntroCTAButton>
            </IntroTextContainer>
        </IntroContainer>
    );
}