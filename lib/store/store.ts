import { create, StateCreator } from "zustand";
import { createDialogStore } from "./dialogStore";

export type StateSlice<T extends object> = StateCreator<T>;

type StateFromFunctions<T extends [...any]> = T extends [infer F, ...infer R]
  ? F extends (...args: any) => object
    ? StateFromFunctions<R> & ReturnType<F>
    : unknown
  : unknown;

type State = StateFromFunctions<[typeof createDialogStore]>;

export const useStore = create<State>((...a) => ({
  ...createDialogStore(...a),
}));
