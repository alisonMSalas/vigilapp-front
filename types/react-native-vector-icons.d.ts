declare module 'react-native-vector-icons/FontAwesome' {
  import { Component } from 'react';
    import { TextProps } from 'react-native';

  interface FontAwesomeProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class FontAwesome extends Component<FontAwesomeProps> {}
}
