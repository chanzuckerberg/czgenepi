import React from "react";
import {
    HeroEmailForm,
    EmailInput,
    SubmitButton,
    SubmitIcon
} from "./style";

export default function EmailForm(): JSX.Element {

    return (
        <HeroEmailForm>
                <EmailInput 
                    type="email" 
                    placeholder="Your email address"
                    />
                <SubmitButton type="submit">
                    Join the waitlist 
                    <SubmitIcon>
                        <svg width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.05707 1.12671L5.08221 5.15186L1.05707 9.177" stroke="white" stroke-width="1.4231"/>
                        </svg>
                    </SubmitIcon>
                </SubmitButton>
        </HeroEmailForm>
    );
}