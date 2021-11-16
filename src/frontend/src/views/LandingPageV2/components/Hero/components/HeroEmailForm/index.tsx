import React, { useState } from "react";
import FormSubmitArrow from "src/common/images/form-submit-arrow.svg";
import {
    HeroEmailForm,
    EmailInput,
    SubmitButton,
    SubmitIcon
} from "./style";

export default function EmailForm(): JSX.Element {

    const [enteredEmail, setEnteredEmail] = useState("");

    function submitEmail(e: React.FormEvent<HTMLInputElement>) {
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
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        setEnteredEmail(e.target.value);
                    }}
                    />
                <SubmitButton
                    onClick={(e: React.FormEvent<HTMLInputElement>) => {
                        submitEmail(e);
                    }}
                    >
                    Join the waitlist 
                    <SubmitIcon>
                        <FormSubmitArrow />
                    </SubmitIcon>
                </SubmitButton>
        </HeroEmailForm>
    );
}