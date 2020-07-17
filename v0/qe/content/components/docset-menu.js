import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { IconSchema } from '@apollo/space-kit/icons/IconSchema';
import { ReactComponent as ReactLogo } from '../img/react-logo.svg';
import {
  NavItemsContext,
  NavItemTitle,
  NavItemDescription
} from 'gatsby-theme-apollo-docs';
import { colors } from 'gatsby-theme-apollo-core';
import { colors as spaceKitColors } from '@apollo/space-kit/colors';
import { size } from 'polished';

const Wrapper = styled.div({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(270px, 1fr))`,
  gridGap: 12,
  paddingTop: 8
});

const MenuItem = styled.div({
  display: 'flex'
});

function getBoxShadow(opacity, y, blur) {
  return `rgba(18, 21, 26, ${opacity}) 0 ${y}px ${blur}px`
}

const {green} = spaceKitColors;
const IconWrapper = styled.div({
  ...size(28),
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 16,
  boxShadow: [
    getBoxShadow(0.12, 1, 2),
    getBoxShadow(0.1, 2, 4),
    getBoxShadow(0.08, 5, 10),
    `inset rgba(45, 31, 102, 0.4) 0 -1px 2px`
  ].toString(),
  borderRadius: 8,
  color: green.lighter,
  backgroundImage: `linear-gradient(${[green.base, green.dark]})`,
  svg: {
    ...size(16),
    fill: 'currentColor'
  }
});

const TextWrapper = styled.div({
  color: colors.text1
});

const StyledLink = styled.a({
  color: 'inherit',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline'
  }
});

const icons = [
  <ReactLogo />,
  <IconSchema weight="thin" />,
];

export default function DocsetMenu() {
  const navItems = useContext(NavItemsContext);
  return (
    <Wrapper>
      {navItems.filter((navItem) => {
        return !(navItem.omitLandingPage);
      }).map((navItem, index) => (
        <MenuItem key={navItem.url}>
          <IconWrapper>
            {icons[index]}
          </IconWrapper>
          <TextWrapper>
            <NavItemTitle>
              <StyledLink href={navItem.url}>
                {navItem.title}
              </StyledLink>
            </NavItemTitle>
            <NavItemDescription>{navItem.description}</NavItemDescription>
          </TextWrapper>
        </MenuItem>
      ))}
    </Wrapper>
  );
}