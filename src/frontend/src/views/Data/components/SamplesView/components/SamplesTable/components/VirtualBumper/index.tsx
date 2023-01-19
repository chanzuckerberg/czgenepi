import { TableRow } from "czifui";

interface Props {
  padding?: number;
}

/**
 * This component adds a bumper onto the top and bottom of the virtualized list.
 * Without a bumper, your list may jump around as you scroll.
 */
const VirtualBumper = ({ padding }: Props): JSX.Element => {
  if (padding <= 0) return null;

  return (
    <TableRow>
      <td style={{ height: `${padding}px` }} />
    </TableRow>
  );
};

export { VirtualBumper };
