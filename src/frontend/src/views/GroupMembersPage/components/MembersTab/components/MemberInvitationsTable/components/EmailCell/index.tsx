import React from "react";
import { Tag } from "src/common/components/library/Tag";
import { PersonIconCell } from "../../../PersonIconCell";
import { Wrapper } from "./style";

interface Props {
  email: string;
  status: "pending" | "expired";
}

const EmailCell = ({ email, status }: Props): JSX.Element => {
  const color = status === "expired" ? "warning" : "primary";

  return (
    <Wrapper>
      <PersonIconCell content={email} />
      <Tag
        color={color}
        sdsType="secondary"
        sdsStyle="rounded"
        label={status}
      />
    </Wrapper>
  );
};

export { EmailCell };
