import { Icon } from "czifui";
import { useState } from "react";
import { EmailInput, HeroEmailForm, SubmitButton, SubmitIcon } from "./style";

export default function EmailForm(): JSX.Element {
  const [enteredEmail, setEnteredEmail] = useState<string>("");

  function submitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const emailRegex =
      /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (emailRegex.test(enteredEmail)) {
      window.open(
        `https://airtable.com/shrblHnTRd9dtu6c0?prefill_Email=${enteredEmail}`, // <-- replace url with new airtable form
        "_blank"
      );
    } else {
      alert("Please enter a valid email address.");
    }
  }

  return (
    <HeroEmailForm onSubmit={submitEmail}>
      <EmailInput
        placeholder="Your email address"
        aria-labelledby="join-waitlist"
        value={enteredEmail}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setEnteredEmail(e.target.value);
        }}
      />
      <SubmitButton id="join-waitlist" type="submit">
        Join the waitlist
        <SubmitIcon>
          <Icon sdsIcon="chevronRight" sdsSize="xs" sdsType="static" />
        </SubmitIcon>
      </SubmitButton>
    </HeroEmailForm>
  );
}
