import { Button, Icon } from "czifui";
import React, { useEffect, useState } from "react";
import { useEditTree } from "src/common/queries/trees";
import BaseDialog from "src/components/BaseDialog";
import Notification from "src/components/Notification";
import { TreeNameInput } from "src/components/TreeNameInput";
import { StyledDiv, StyledIconButton, StyledTitle } from "./style";

interface Props {
  onClose(): void;
  open: boolean;
  phyloRun?: PhyloRun;
}

export const EditTreeConfirmationModal = ({
  onClose,
  open,
  phyloRun,
}: Props): JSX.Element | null => {
  const [shouldShowErrorNotification, setShouldShowErrorNotification] =
    useState<boolean>(false);
  const [shouldShowSuccessNotification, setShouldShowSuccessNotification] =
    useState<boolean>(false);
  const [newTreeName, setNewTreeName] = useState<string>("");

  const treeNameLength = newTreeName.length;
  const hasValidName = treeNameLength > 0 && treeNameLength <= 128;

  useEffect(() => {
    // this makes sure that the newTreeName defaults to the current tree name,
    // and that the newTreeName state variable resets when we edit a new tree
    const name = phyloRun?.name;
    if (name) {
      setNewTreeName(name);
    }

    // when we have a new tree name that also means that we should reset
    // shouldShow notifications to false since the component is now focused on editing a new tree
    setShouldShowSuccessNotification(false);
    setShouldShowErrorNotification(false);
  }, [
    phyloRun,
    setNewTreeName,
    setShouldShowSuccessNotification,
    setShouldShowErrorNotification,
  ]);

  const editTreeMutation = useEditTree({
    componentOnSuccess: () => {
      setShouldShowSuccessNotification(true);
    },
    componentOnError: () => {
      setShouldShowErrorNotification(true);
    },
  });

  const handleClose = function () {
    onClose();
  };

  if (!phyloRun) return null;

  const { id } = phyloRun;

  const onEdit = () => {
    if (!id) return;

    editTreeMutation.mutate({
      treeIdToEdit: id,
      newTreeName: newTreeName,
    });
    onClose();
  };

  const title = <StyledTitle>Edit Tree Name</StyledTitle>;

  const content = (
    <StyledDiv>
      <TreeNameInput
        setTreeName={setNewTreeName}
        treeName={newTreeName}
        withCollapsibleInstructions={false}
        textInputLabel={"Tree Name: "}
        isTextInputMultiLine={true}
      />
    </StyledDiv>
  );

  const confirmButton = (
    <Button
      sdsType="primary"
      sdsStyle="rounded"
      disabled={!hasValidName}
      onClick={onEdit}
    >
      Update
    </Button>
  );

  const closeIcon = (
    <StyledIconButton onClick={onClose} sdsType="tertiary" sdsSize="small">
      <Icon sdsIcon="xMark" sdsSize="s" sdsType="iconButton" />
    </StyledIconButton>
  );

  return (
    <>
      {shouldShowSuccessNotification && (
        <Notification
          autoDismiss
          buttonOnClick={() => setShouldShowSuccessNotification(false)}
          buttonText="DISMISS"
          dismissDirection="left"
          dismissed={!shouldShowSuccessNotification}
          intent="info"
        >
          Tree name was successfully updated.
        </Notification>
      )}
      {shouldShowErrorNotification && (
        <Notification
          autoDismiss
          buttonOnClick={() => setShouldShowErrorNotification(false)}
          buttonText="DISMISS"
          dismissDirection="left"
          dismissed={!shouldShowErrorNotification}
          intent="error"
        >
          Something went wrong and we were unable to update your tree name.
          Please try again later.
        </Notification>
      )}
      <BaseDialog
        open={open}
        onClose={handleClose}
        title={title}
        content={content}
        actionButton={confirmButton}
        closeIcon={closeIcon}
      />
    </>
  );
};
