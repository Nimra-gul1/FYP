import { Text, TextInput } from 'react-native';

if (!Text.__isUIPatched) {
  Text.__isUIPatched = true;

  if (Text.defaultProps == null) Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;

  if (TextInput.defaultProps == null) TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}
