import * as React from 'react';
import { ViewStyle, LayoutChangeEvent } from 'react-native';

export interface IncrementalProps {
  onDone?: () => void;
  name?: string;
  children: React.ReactNode;
}

export class Incremental extends React.Component<IncrementalProps> {}

export interface IncrementalGroupProps {
  onDone?: () => void;
  name: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export class IncrementalGroup extends React.Component<IncrementalGroupProps> {}

export interface IncrementalPresenterProps {
  name: string;
  disabled?: boolean;
  onDone?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export class IncrementalPresenter extends React.Component<IncrementalPresenterProps> {}
