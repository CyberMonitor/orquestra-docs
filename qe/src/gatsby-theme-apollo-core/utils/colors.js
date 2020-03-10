const { colors } = require("gatsby-theme-apollo-core/src/utils/colors")
const {colors : spaceKitColors} = require('@apollo/space-kit/colors');

exports.colors = {
    ...colors,
    primary: spaceKitColors.green.dark,
    primaryLight: spaceKitColors.green.lighter,
    secondary: spaceKitColors.blue.base,
    tertiary: spaceKitColors.blue.dark,
    tertiaryLight: spaceKitColors.blue.base,
    divider: spaceKitColors.silver.dark,
    background: spaceKitColors.silver.light,
    background2: spaceKitColors.silver.base,
    text1: spaceKitColors.black.lighter,
    text2: spaceKitColors.grey.dark,
    text3: spaceKitColors.grey.light,
    text4: spaceKitColors.silver.darker,
    warning: spaceKitColors.blue.base,
    shadow: spaceKitColors.black.darker,
    highlight: spaceKitColors.blue.base,
    highlight2: spaceKitColors.orange.lighter,
    highlight3: spaceKitColors.orange.lightest,
    hoverOpacity: 0.8
}