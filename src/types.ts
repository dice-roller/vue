import type { DiceRoll } from '@dice-roller/rpg-dice-roller';
import type {
  ComputedRef,
  InputHTMLAttributes,
  MaybeRefOrGetter,
  VNodeChild,
  WritableComputedRef,
  Ref,
} from 'vue';

export interface DiceRollerLabels {
  notation: string;
  copy: string;
  copied: string;
  copyError: string;
  invalidNotation: string;
  error: string;
}

export type DiceRollerInputAttrs = Omit<
  InputHTMLAttributes,
  'id' | 'value' | 'type' | 'name'
> &
  Record<string, unknown>;
export interface UseDiceRollerOptions {
  notation?: MaybeRefOrGetter<string | null | undefined>;
  labels?: MaybeRefOrGetter<Partial<DiceRollerLabels> | undefined>;
  onNotationChange?: (notation: string) => void;
  onRoll?: (notation: string, result: DiceRoll | null) => void;
}
export interface DiceRollerClipboard {
  copy: () => Promise<void>;
  copied: boolean;
  text: string;
  isSupported: boolean;
  error: string | null;
}
export interface DiceRollerInputHandlers {
  input: (event: Event) => void;
  change: (event: Event) => void;
  keydown: (event: KeyboardEvent) => void;
}
export interface UseDiceRollerReturn {
  currentNotation: WritableComputedRef<string>;
  error: Ref<string | null>;
  output: Ref<DiceRoll | null>;
  roll: () => void;
  labels: ComputedRef<DiceRollerLabels>;
  setNotation: (notation: string) => void;
  bind: ComputedRef<{ value: string }>;
  on: DiceRollerInputHandlers;
  copy: DiceRollerClipboard;
}
export type DiceRollerEmits = {
  'notation:change': [notation: string];
  'update:notation': [notation: string];
  roll: [notation: string, result: DiceRoll | null];
};
export type DiceRollerSlots = { button?: () => VNodeChild };
export interface DiceRollerSlotProps {
  currentNotation: string;
  error: string | null;
  output: DiceRoll | null;
  roll: () => void;
  labels: DiceRollerLabels;
  bind: { value: string };
  on: DiceRollerInputHandlers;
  copy: DiceRollerClipboard;
}

export type BootstrapVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';
export type BootstrapBackgroundVariant =
  BootstrapVariant | 'body' | 'white' | 'transparent';
export type BootstrapBorderVariant = BootstrapVariant | 'white';
export type BootstrapTextVariant =
  BootstrapVariant | 'body' | 'muted' | 'white' | 'black-50' | 'white-50';
export type BootstrapButtonVariant =
  BootstrapVariant | 'link' | `outline-${BootstrapVariant}`;
