import { TableRow } from "czifui";
import { ReactNode } from "react";
import { VirtualItem } from "react-virtual";

interface Props {
  children?: ReactNode;
  totalSize?: number;
  virtualRows?: VirtualItem[];
}

/**
 * This component adds a bumper onto the top and bottom of the virtualized list.
 * Without a bumper, your list may jump around as you scroll.
 */
const VirtualBumper = ({
  children,
  virtualRows,
  totalSize,
}: Props): JSX.Element | null => {
  if (!virtualRows || !totalSize || !children) return null;

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <>
      {paddingTop > 0 && (
        <TableRow>
          <td style={{ height: `${paddingTop}px` }} />
        </TableRow>
      )}
      {children}
      {paddingBottom > 0 && (
        <TableRow>
          <td style={{ height: `${paddingBottom}px` }} />
        </TableRow>
      )}
    </>
  );
};

export { VirtualBumper };
