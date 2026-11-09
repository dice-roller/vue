import { ref, useId } from 'vue';

export function useIdGenerator(prefix = '') {
  const id = ref(`${prefix}${useId()}`);
  return { id };
}
