import { InteractionManager } from 'react-native';
import * as React from 'react';
import { IncrementalGroupContext } from './IncrementalGroupContext';

const DEBUG = false;

/**
 * React Native helps make apps smooth by doing all the heavy lifting off the
 * main thread, in JavaScript.  That works great a lot of the time, except that
 * heavy operations like rendering may block the JS thread from responding
 * quickly to events like taps, making the app feel sluggish.
 *
 * `<Incremental>` solves this by slicing up rendering into chunks that are
 * spread across multiple event loops. Expensive components can be sliced up
 * recursively by wrapping pieces of them and their descendants in
 * `<Incremental>` components. `<IncrementalGroup>` can be used to make sure
 * everything in the group is rendered recursively before calling `onDone` and
 * moving on to another sibling group (e.g. render one row at a time, even if
 * rendering the top level row component produces more `<Incremental>` chunks).
 * `<IncrementalPresenter>` is a type of `<IncrementalGroup>` that keeps it's
 * children invisible and out of the layout tree until all rendering completes
 * recursively. This means the group will be presented to the user as one unit,
 * rather than pieces popping in sequentially.
 *
 * `<Incremental>` only affects initial render - `setState` and other render
 * updates are unaffected.
 *
 * The chunks are rendered sequentially using the `InteractionManager` queue,
 * which means that rendering will pause if it's interrupted by an interaction,
 * such as an animation or gesture.
 *
 * Note there is some overhead, so you don't want to slice things up too much.
 * A target of 100-200ms of total work per event loop on old/slow devices might
 * be a reasonable place to start.
 *
 * Below is an example that will incrementally render all the parts of `Row` one
 * first, then present them together, then repeat the process for `Row` two, and
 * so on:
 *
 *   render: function() {
 *     return (
 *       <ScrollView>
 *         {Array(10).fill().map((rowIdx) => (
 *           <IncrementalPresenter key={rowIdx}>
 *             <Row>
 *               {Array(20).fill().map((widgetIdx) => (
 *                 <Incremental key={widgetIdx}>
 *                   <SlowWidget />
 *                 </Incremental>
 *               ))}
 *             </Row>
 *           </IncrementalPresenter>
 *         ))}
 *       </ScrollView>
 *     );
 *   };
 *
 * If SlowWidget takes 30ms to render, then without `Incremental`, this would
 * block the JS thread for at least `10 * 20 * 30ms = 6000ms`, but with
 * `Incremental` it will probably not block for more than 50-100ms at a time,
 * allowing user interactions to take place which might even unmount this
 * component, saving us from ever doing the remaining rendering work.
 */
export interface IncrementalProps {
  onDone?: () => void;
  name?: string;
  children: React.ReactNode;
}

export function Incremental({
  name,
  children,
  onDone,
}: IncrementalProps): React.ReactElement | null {
  const [doIncrementalRender, setDoIncrementalRender] = React.useState(false);
  const context = React.useContext(IncrementalGroupContext);
  const incrementalId = (context?.incrementalCount ?? 0) + 1;
  const incrementalIdRef = React.useRef(incrementalId);
  const mountedRef = React.useRef(false);
  const renderedRef = React.useRef(false);

  const getName = () => {
    return context?.groupId + ':' + incrementalIdRef.current + '-' + name;
  };

  React.useEffect(() => {
    if (context == null) {
      return;
    }
    InteractionManager.runAfterInteractions({
      name: 'Incremental:' + getName(),
      gen: () =>
        new Promise<void>((resolve) => {
          if (!mountedRef.current || renderedRef.current) {
            resolve();
            return;
          }
          DEBUG && console.log('set doIncrementalRender for ' + getName());
          setDoIncrementalRender(true);
          resolve();
        }),
    })
      .then(() => {
        DEBUG && console.log('call onDone for ' + getName());
        if (mountedRef.current) {
          onDone?.();
        }
      })
      .catch((ex) => {
        ex.message = `Incremental render failed for ${getName()}: ${
          ex.message
        }`;
        throw ex;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    if (context == null) {
      onDone?.();
    }
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    renderedRef.current || // Make sure that once we render once, we stay rendered even if incrementalGroupEnabled gets flipped.
    !context?.enabled ||
    doIncrementalRender
  ) {
    DEBUG && console.log('render ' + getName());
    renderedRef.current = true;
    return children as React.ReactElement;
  }
  return null;
}
