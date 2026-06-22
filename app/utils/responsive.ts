import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * wp: Width Percentage
 * Converts provided width percentage to independent pixels.
 * @param widthPercent The percentage of screen's width (0-100)
 */
const wp = (widthPercent: number | string) => {
  const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel(SCREEN_WIDTH * elemWidth / 100);
};

/**
 * hp: Height Percentage
 * Converts provided height percentage to independent pixels.
 * @param heightPercent The percentage of screen's height (0-100)
 */
const hp = (heightPercent: number | string) => {
  const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel(SCREEN_HEIGHT * elemHeight / 100);
};

/**
 * scale: Scaling utility for padding, margin, width, height, etc.
 * Based on screen width.
 */
const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * verticalScale: Scaling utility for heights/vertical spacing.
 */
const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * rf: Responsive Font Size
 * Scales font size based on screen width/height ratio.
 * This is safer than just scaling by width as it handles tablets better.
 */
const rf = (size: number, factor = 0.5) => {
  const scaleValue = (SCREEN_WIDTH / guidelineBaseWidth) * size;
  return Math.round(size + (scaleValue - size) * factor);
};

export { wp, hp, scale, verticalScale, rf };
