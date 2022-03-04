import { Incremental, IncrementalProps } from './Incremental';
import * as React from 'react';
import { IncrementalGroupContext } from './IncrementalGroupContext';

let _groupCounter = -1;
const DEBUG = false;

export interface IncrementalGroupProps extends IncrementalProps {
  disabled?: boolean;
}

/**
 * `<Incremental>` components must be wrapped in an `<IncrementalGroup>` (e.g.
 * via `<IncrementalPresenter>`) in order to provide the incremental group
 * context, otherwise they will do nothing.
 *
 * See Incremental.tsx for more info.
 */
export function IncrementalGroup({
  name,
  children,
  disabled,
  onDone,
}: IncrementalGroupProps) {
  const groupIncRef = React.useRef(`g${++_groupCounter}-`);
  const context = React.useContext(IncrementalGroupContext);

  const getGroupId = React.useCallback(() => {
    const prefix = context != null ? context.groupId + ':' : '';
    return prefix + groupIncRef.current + name;
  }, [context, name]);

  React.useEffect(() => {
    DEBUG && console.log('create IncrementalGroup with id ' + getGroupId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const childContext = React.useMemo(
    () => ({
      enabled: !(disabled || context?.enabled === false),
      groupId: getGroupId(),
      incrementalCount: -1,
    }),
    [context?.enabled, disabled, getGroupId],
  );

  return (
    <IncrementalGroupContext.Provider value={childContext}>
      <Incremental onDone={onDone}>{children}</Incremental>
    </IncrementalGroupContext.Provider>
  );
}
