import { IncrementalGroup } from './IncrementalGroup';
import * as React from 'react';
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native';
import { IncrementalGroupContext } from './IncrementalGroupContext';

/**
 * `<IncrementalPresenter>` can be used to group sets of `<Incremental>` renders
 * such that they are initially invisible and removed from layout until all
 * descendants have finished rendering, at which point they are drawn all at once
 * so the UI doesn't jump around during the incremental rendering process.
 *
 * See Incremental.js for more info.
 */
export interface IncrementalPresenterProps {
  children?: React.ReactNode;
  disabled?: boolean;
  name: string;
  onDone?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: ViewStyle;
}

export function IncrementalPresenter({
  children,
  disabled,
  name,
  onDone,
  onLayout,
  style,
}: IncrementalPresenterProps) {
  const isDoneRef = React.useRef(false);
  const context = React.useContext(IncrementalGroupContext);
  const viewRef = React.useRef<View>(null);

  const onDoneInternal = () => {
    isDoneRef.current = true;
    if (disabled !== true && context?.enabled !== false) {
      // Avoid expensive re-renders and use setNativeProps
      viewRef.current?.setNativeProps({
        style: [style, { opacity: 1, position: 'relative' }],
      });
    }
    onDone?.();
  };

  let viewStyle: StyleProp<ViewStyle>;
  if (disabled !== true && context?.enabled !== false && !isDoneRef.current) {
    viewStyle = [style, { opacity: 0, position: 'absolute' }];
  } else {
    viewStyle = style;
  }
  return (
    <IncrementalGroup onDone={onDoneInternal} name={name} disabled={disabled}>
      <View style={viewStyle} onLayout={onLayout} ref={viewRef}>
        {children}
      </View>
    </IncrementalGroup>
  );
}
