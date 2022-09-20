import { Button, Dialog, DialogActions, DialogTitle } from "czifui";
import { compact, filter, uniq } from "lodash";
import { ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
import { noop } from "src/common/constants/empty";
import {
  GREEDY_SPACES,
  INPUT_DELIMITERS_WITH_SPACE,
} from "src/common/constants/inputDelimiters";
import { useSendGroupInvitations } from "src/common/queries/groups";
import { FALLBACK_GROUP_ID } from "src/common/redux";
import { addNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import { selectCurrentGroup } from "src/common/redux/selectors";
import { B } from "src/common/styles/basicStyle";
import { InvalidEmailError } from "./components/InvalidEmailError";
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

const InviteModal = ({
  groupName,
  onClose,
  open,
}: Props): JSX.Element | null => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState<string>("");
  const [hasMoreThan50Invites, setHasMoreThan50Invites] =
    useState<boolean>(false);
  const [invalidAddresses, setInvalidAddresses] = useState<string[]>([]);
  // @ts-expect-error remove when api call finished
  const [shouldValidateOnChange, setShouldValidateOnChange] = // eslint-disable-line @typescript-eslint/no-unused-vars
    useState<boolean>(false);
  const [sentCount, setSentCount] = useState<number>(0);
  const [failedToSendAddresses, setFailedToSendAddresses] = useState<string[]>(
    []
  );

  const sendInvitationMutation = useSendGroupInvitations({
    componentOnSuccess: ({ invitations }) => {
      // show a warning if we aren't sending invites for existing users
      const failedInvites = filter(invitations, (i) => !i.success);
      setFailedToSendAddresses(failedInvites.map((i) => i.email));
      if (failedInvites.length > 0) {
        dispatch(addNotification({
          id: Date.now(),
          shouldShowCloseButton: true,
          intent: "warning",
          componentProps: {
            failedToSendAddresses,
          }
        }));
      }

      // show success for any invites we did send
      const successCount = invitations.length - failedInvites.length;
      setSentCount(successCount);
      if (successCount > 0) {
        dispatch(addNotification({
          shouldShowCloseButton: true,
          intent: "info",
          autoDismiss: true,
          componentProps: {
            numSent: sentCount,
          }
        }));
      }

      handleClose();
    },
    componentOnError: noop,
  });

  // can't send invites if we don't know what group they are in
  const groupId = useSelector(selectCurrentGroup);
  if (groupId === FALLBACK_GROUP_ID) return null;

  const handleClose = () => {
    setInputValue("");
    setHasMoreThan50Invites(false);
    setInvalidAddresses([]);
    setShouldValidateOnChange(false);

    onClose();
  };

  /**
   * Gets user input and chunks into (what should be) email addresses.
   *
   * Original user input text is broken into chunks by delimiters. Repeated
   * delimiters between chunks are taken as a single delimiter. Leading and
   * trailing delimiters are dropped. If a given chunk is found multiple times
   * in the input, only one copy of the chunk is returned in output array.
   *
   * Example:
   *     user1@example.com,   user2@example.com, ,, ,,  , user3@example.com,,
   *   user2@example.com, user4@example.com,,
   * Would return as four emails in total, as you'd expect to read them.
   */
  const getAddressArrayFromInputValue = (): string[] => {
    // First pass may have multiple spaces between chunks or pre/suffix spaces
    const delimitBySpaces = inputValue.replace(
      INPUT_DELIMITERS_WITH_SPACE,
      " "
    );
    const delimitBySingleSpaceTrimmed = delimitBySpaces
      .trim()
      .replace(GREEDY_SPACES, " ");
    const addressChunks = delimitBySingleSpaceTrimmed.split(" ");
    return uniq(addressChunks);
  };

  // Returns bool of if emails valid. If not, sets the state to show errors.
  const validate = (addresses: string[]): boolean => {
    const newInvalidAddresses = compact(
      addresses.filter((address) => !address.match(EMAIL_REGEX))
    );

    setInvalidAddresses(newInvalidAddresses);

    const hasMoreThan50 = addresses.length > 50;
    setHasMoreThan50Invites(hasMoreThan50);

    // after they click the button to send invites once, we should debounce validate on
    // all subsequent changes
    // TODO: debounce check validation on subsequent changes
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

  const handleFormSubmit = () => {
    const emails = getAddressArrayFromInputValue();
    // If invalid, `validate` will alter state and cause error display
    const areAllAddressesValid = validate(emails);
    if (areAllAddressesValid) {
      sendInvitationMutation.mutate({ emails });
    }
  };

  return (
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
  );
};

export { InviteModal };
