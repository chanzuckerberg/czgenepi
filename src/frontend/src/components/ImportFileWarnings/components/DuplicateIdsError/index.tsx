import { B } from "src/common/styles/basicStyle";
import { pluralize } from "src/common/utils/strUtils";
import AlertAccordion from "src/components/AlertAccordion";
import { StyledTable } from "./style";

interface Props {
  duplicatePrivateIds?: string[] | null;
  duplicatePublicIds?: string[] | null;
}

const DuplicateIdsMessage = ({
  duplicatePrivateIds = [],
  duplicatePublicIds = [],
}: Props): JSX.Element | null => {
  if (!duplicatePrivateIds || !duplicatePublicIds) return null;
  const hasDupPrivate = duplicatePrivateIds.length > 0;
  const hasDupPublic = duplicatePublicIds.length > 0;

  return (
    <div>
      You can update the duplicate IDs in the table below, or update your file
      and re-import.
      {(hasDupPrivate || hasDupPublic) && (
        <StyledTable>
          {hasDupPrivate && (
            <tbody>
              <span>
                <B>Duplicate Private IDs: </B> {duplicatePrivateIds.join(", ")}
              </span>
            </tbody>
          )}
          {hasDupPublic && (
            <tbody>
              <span>
                <B>Duplicate Public IDs: </B> {duplicatePublicIds.join(", ")}
              </span>
            </tbody>
          )}
        </StyledTable>
      )}
    </div>
  );
};

const DuplicateIdsError = ({
  duplicatePrivateIds = [],
  duplicatePublicIds = [],
}: Props): JSX.Element | null => {
  if (!duplicatePrivateIds || !duplicatePublicIds) return null;
  const totalErrorCount =
    duplicatePrivateIds.length + duplicatePublicIds.length;

  const title = (
    <span>
      <B>
        {totalErrorCount} {pluralize("Sample", totalErrorCount)}{" "}
        {pluralize("has", totalErrorCount)} duplicate Private or Public IDs.
      </B>{" "}
      Please review and correct before proceeding.
    </span>
  );

  return (
    <AlertAccordion
      intent="error"
      title={title}
      collapseContent={
        <DuplicateIdsMessage
          duplicatePrivateIds={duplicatePrivateIds}
          duplicatePublicIds={duplicatePublicIds}
        />
      }
    />
  );
};

export { DuplicateIdsError };
