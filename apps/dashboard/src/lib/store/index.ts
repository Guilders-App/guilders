import { type StateCreator, create } from "zustand";
import { createDialogStore } from "./dialogStore";

export type StateSlice<T extends object> = StateCreator<T>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type StateFromFunctions<T extends [...any]> = T extends [infer F, ...infer R]
  ? // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    F extends (...args: any) => object
    ? StateFromFunctions<R> & ReturnType<F>
    : unknown
  : unknown;

type State = StateFromFunctions<[typeof createDialogStore]>;

export const useStore = create<State>((...a) => ({
  ...createDialogStore(...a),
}));
