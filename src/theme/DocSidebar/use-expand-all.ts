import { useCallback, useState } from 'react';

type ExpandAllEmit = (expand: boolean) => void;
type ExpandAllListen = (callback: ExpandAllCallback) => ExpandAllStopListen;
type ExpandAllStopListen = () => void;
type ExpandAllCallback = (expanded: boolean) => void;

export function useExpandAll(): [ExpandAllEmit, ExpandAllListen] {
  const [listeners] = useState<ExpandAllCallback[]>([]);
  const listen = useCallback(
    (callback: ExpandAllCallback) => {
      listeners.push(callback);
      return () => {
        const index = listeners.indexOf(callback);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      };
    },
    [listeners]
  );
  const emit = useCallback(
    (expand: boolean) => {
      for (let listener of listeners) {
        listener(expand);
      }
    },
    [listeners]
  );
  return [emit, listen];
}
