import { Icon } from "czifui";
import React from "react";
import { useDispatch } from "react-redux";
import { setGroup } from "src/common/redux/actions";
import { MenuItem, StyledIcon, StyledIconButton, StyledName } from "./style";

interface Props {
  id?: number; // this will be used once we hook up click handler to switch group
  name: string;
}

const GroupMenuItem = ({ id, name }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const onClick = () => {
    // switch group
    dispatch(setGroup(id));
  };

  return (
    <MenuItem onClick={onClick}>
      <StyledIcon>
        <Icon sdsIcon="people" sdsSize="s" sdsType="static" />
      </StyledIcon>
      <StyledName>{name}</StyledName>
      <StyledIconButton sdsType="tertiary" sdsSize="small">
        <Icon sdsIcon="chevronRight" sdsType="iconButton" sdsSize="s" />
      </StyledIconButton>
    </MenuItem>
  );
};

export { GroupMenuItem };
