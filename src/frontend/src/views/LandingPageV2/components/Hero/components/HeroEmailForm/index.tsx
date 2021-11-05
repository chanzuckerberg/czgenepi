import React, { useState } from "react";
import {
    HeroEmailForm,
    EmailInput,
    SubmitButton,
    SubmitIcon
} from "./style";

export default function EmailForm(): JSX.Element {

    const [enteredEmail, setEnteredEmail] = useState("");

    function submitEmail(e) {
        e.preventDefault();

        let emailRegex = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (emailRegex.test(enteredEmail)) {
            window.open(
                `https://airtable.com/shrBGT42xVBR6JAVv?prefill_Email=${enteredEmail}`, // <-- replace url with new airtable form
                "_blank"
            );
        } else {
            alert("Please enter a valid email address.");
        }
    }

    return (
        <HeroEmailForm>
                <EmailInput
                    placeholder="Your email address"
                    value={enteredEmail}
                    onChange={e => {
                        setEnteredEmail(e.target.value);
                    }}
                    />
                <SubmitButton
                    onClick={e => {
                        submitEmail(e);
                    }}
                    >
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