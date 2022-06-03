import { Button, Dialog, DialogActions, DialogTitle } from "czifui";
import { compact } from "lodash";
import React, { ChangeEvent, useState } from "react";
import { INPUT_DELIMITERS } from "src/common/constants/inputDelimiters";
import { useUserInfo } from "src/common/queries/auth";
import { useSendGroupInvitations } from "src/common/queries/groups";
import { B } from "src/common/styles/basicStyle";
import { getGroupIdFromUser } from "src/common/utils/userUtils";
import { InvalidEmailError } from "./components/InvalidEmailError";
import { SentNotification } from "./components/InvalidEmailError/components/SentNotification";
import {
  SmallText,
  StyledCallout,
  StyledDialogContent,
  StyledInputText,
  StyledInstructions,
} from "./style";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/g;

interface Props {
  groupName: string;
  onClose(): void;
  open: boolean;
}

const InviteModal = ({ groupName, onClose, open }: Props): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>("");
  const [hasMoreThan50Invites, setHasMoreThan50Invites] =
    useState<boolean>(false);
  const [invalidAddresses, setInvalidAddresses] = useState<string[]>([]);
  const [shouldValidateOnChange, setShouldValidateOnChange] =
    useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [sentCount, setSentCount] = useState<number>(0);

  const { data: userInfo } = useUserInfo();
  const groupId = getGroupIdFromUser(userInfo);

  const handleClose = () => {
    setInputValue("");
    setHasMoreThan50Invites(false);
    setInvalidAddresses([]);
    setShouldValidateOnChange(false);
    setIsNotificationOpen(false);

    onClose();
  };

  const getAddressArrayFromInputValue = () => {
    return inputValue.trim().split(INPUT_DELIMITERS);
  };

  const validate = (): boolean => {
    const addresses = getAddressArrayFromInputValue();
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

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const instructions = [
    <span key={0}>You can send a maximum of 50 invitations at a time.</span>,
    <span key={1}>Separate emails by tabs, commas, or enter one per row.</span>,
    <span key={2}>
      Members have full access to group samples and phylogenetic trees; they are
      able to build trees, upload, download, edit, and delete data.
    </span>,
  ];

  const inputIntent = invalidAddresses.length > 0 ? "error" : "default";

  const sendInvitationMutation = useSendGroupInvitations({
    componentOnSuccess: (emails) => {
      setSentCount(emails.length);
      setIsNotificationOpen(true);
      handleClose();
    },
  });

  const handleFormSubmit = () => {
    const areAllAddressesValid = validate();
    if (!areAllAddressesValid) return;

    const emails = getAddressArrayFromInputValue();
    sendInvitationMutation.mutate({ emails, groupId });
  };

  return (
    <>
      <SentNotification
        numSent={sentCount}
        onDismiss={() => setIsNotificationOpen(false)}
        open={isNotificationOpen}
      />
      <Dialog open={open} onClose={handleClose} sdsSize="s">
        <DialogTitle title={`Invite to ${groupName}`} onClose={handleClose} />{" "}
        {/* TODO (mlila): make group name bold after sds dialog allows ReactNode */}
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
            label="Emails"
            onChange={onInputChange}
            placeholder="e.g. userone@domain.com, usertwo@domain.com"
            intent={inputIntent}
            value={inputValue}
            maxRows={4}
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
            disabled={!inputValue}
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
