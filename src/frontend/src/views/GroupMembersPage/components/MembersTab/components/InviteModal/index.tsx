import { Button, Dialog, DialogActions, DialogTitle } from "czifui";
import { compact } from "lodash";
import React, { ChangeEvent, useState } from "react";
import { INPUT_DELIMITERS } from "src/common/constants/inputDelimiters";
import { B } from "src/common/styles/basicStyle";
import { InvalidEmailError } from "./components/InvalidEmailError";
import { SentNotification } from "./components/InvalidEmailError/components/SentNotification";
import {
  SmallText,
  StyledCallout,
  StyledDialogContent,
  StyledInputText,
  StyledInstructions,
  StyledSpan,
} from "./style";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/g;

interface Props {
  onClose(): void;
}

const InviteModal = ({ onClose }: Props): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>("");
  const [hasMoreThan50Invites, setHasMoreThan50Invites] =
    useState<boolean>(false);
  const [invalidAddresses, setInvalidAddresses] = useState<string[]>([]);
  const [shouldValidateOnChange, setShouldValidateOnChange] = // eslint-disable-line @typescript-eslint/no-unused-vars
    useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  const validate = (): boolean => {
    const addresses = inputValue.trim().split(INPUT_DELIMITERS);
    const newInvalidAddresses = compact(
      addresses.filter((address) => !address.match(EMAIL_REGEX))
    );

    setInvalidAddresses(newInvalidAddresses);

    const hasMoreThan50 = addresses.length > 50;
    setHasMoreThan50Invites(hasMoreThan50);

    // after they click the button to send invites once, we should debounce validate on
    // all subsequent changes
    setShouldValidateOnChange(true);

    return (
      !hasMoreThan50 && newInvalidAddresses.length === 0 && addresses.length > 0
    );
  };

  const onInputChange = (e: ChangeEvent) => {
    const value = e.target.value;
    setInputValue(value);
    validate();
  };

  const title = (
    <StyledSpan>
      Invite to <B>Santa Clara County</B>
    </StyledSpan>
  );

  const instructions = [
    <span key={0}>You can send a maximum of 50 invitations at a time.</span>,
    <span key={1}>Separate emails by tabs, commas, or enter one per row.</span>,
    <span key={2}>
      Members have full access to group samples and phyogenetic trees; they are
      able to build trees, upload, download, edit, and delete data.
    </span>,
  ];

  const inputIntent = invalidAddresses.length > 0 ? "error" : "default";

  const handleFormSubmit = () => {
    const areAllAddressesValid = validate();
    if (!areAllAddressesValid) return;

    // TODO (mlila): api call
  };

  return (
    <>
      <SentNotification
        numSent={5} // TODO (mlila): update after API call return
        onDismiss={() => setIsNotificationOpen(false)}
        open={isNotificationOpen}
      />
      <Dialog open onClose={onClose} sdsSize="s">
        <DialogTitle title={title} onClose={onClose} />
        <StyledDialogContent>
          <StyledInstructions
            title="Instructions"
            titleSize="s"
            bodySize="xs"
            items={instructions}
          />
          <StyledInputText
            id="invite-email-input"
            sdsType="textArea"
            label={<B>Emails</B>}
            onChange={onInputChange}
            placeholder="e.g. userone@domain.com, usertwo@domain.com"
            intent={inputIntent}
            value={inputValue}
          />
          {hasMoreThan50Invites && (
            <StyledCallout intent="error">
              <B>You can’t send more than 50 invites at a time. </B>
              Please reduce the number of emails before continuing.
            </StyledCallout>
          )}
          <InvalidEmailError invalidAddresses={invalidAddresses} />
        </StyledDialogContent>
        <DialogActions buttonPosition="left">
          <Button
            sdsType="primary"
            sdsStyle="rounded"
            disabled={!inputValue || invalidAddresses.length > 0}
            onClick={handleFormSubmit}
          >
            Send Invites
          </Button>
        </DialogActions>
        <SmallText>Invites will expire 14 days after they are sent.</SmallText>
      </Dialog>
    </>
  );
};

export { InviteModal };
