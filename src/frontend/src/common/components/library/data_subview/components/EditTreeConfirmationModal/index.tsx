import { Button, Icon } from "czifui";
import { useEffect, useState } from "react";
import { useEditTree } from "src/common/queries/trees";
import { addNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import BaseDialog from "src/components/BaseDialog";
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
  const dispatch = useDispatch();
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
  }, [
    phyloRun,
    setNewTreeName,
  ]);

  const editTreeMutation = useEditTree({
    componentOnSuccess: () => {
      dispatch(addNotification({
        autoDismiss: true,
        dismissDirection: "left",
        intent: "info",
        text: "Tree name was successfully updated.",
      }));
    },
    componentOnError: () => {
      dispatch(addNotification({
        autoDismiss: true,
        dismissDirection: "left",
        intent: "error",
        text: "Something went wrong and we were unable to update your tree name. Please try again later.",
      }));
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
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={title}
      content={content}
      actionButton={confirmButton}
      closeIcon={closeIcon}
    />
  );
};
