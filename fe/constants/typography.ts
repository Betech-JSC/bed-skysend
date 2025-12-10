import { Platform } from 'react-native';

export const Typography = {
  // HIG Large Title - 34pt, Regular
  largeTitle: {
    fontSize: 34,
    fontWeight: '400' as const,
    lineHeight: 41,
    letterSpacing: 0.37,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  // HIG Title 1 - 28pt, Regular
  title1: {
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 34,
    letterSpacing: 0.36,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  // HIG Title 2 - 22pt, Regular
  title2: {
    fontSize: 22,
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: 0.35,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  // HIG Title 3 - 20pt, Regular
  title3: {
    fontSize: 20,
    fontWeight: '400' as const,
    lineHeight: 25,
    letterSpacing: 0.38,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  // HIG Headline - 17pt, Semibold
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Body - 17pt, Regular
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Callout - 16pt, Regular
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: -0.32,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Subhead - 15pt, Regular
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Footnote - 13pt, Regular
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Caption 1 - 12pt, Regular
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Caption 2 - 11pt, Regular
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.07,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
};
