import { Icon } from "czifui";
import { useRouter } from "next/router";
import React from "react";
import { ROUTES } from "src/common/routes";
import {
  Body,
  ErrorContainer,
  Header,
  IconWrapper,
  StyledBlackLogo,
  StyledButton,
  StyledNarrowContainer,
  Text,
  Title,
} from "./style";

interface Props {
  title: string;
  text: string;
}

const AuthenticationError = ({ title, text }: Props): JSX.Element => {
  const router = useRouter();
  const onClick = () => {
    router.push(ROUTES.HOMEPAGE);
  };

  return (
    <StyledNarrowContainer>
      <ErrorContainer>
        <Header>
          <StyledBlackLogo />
        </Header>
        <Body>
          <IconWrapper>
            <Icon
              sdsIcon="exclamationMarkCircle"
              sdsSize="xl"
              sdsType="static"
            />
          </IconWrapper>
          <Title>{title}</Title>
          <Text>{text}</Text>
          <StyledButton sdsStyle="rounded" sdsType="primary" onClick={onClick}>
            Go to Home
          </StyledButton>
        </Body>
      </ErrorContainer>
    </StyledNarrowContainer>
  );
};

export { AuthenticationError };
