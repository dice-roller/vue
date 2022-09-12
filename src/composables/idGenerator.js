import { ref } from 'vue';

const getRandomId = () => crypto?.randomUUID() || `${Date.now().toString(32)}-${Math.random().toString(36).substring(2)}`;

export function useIdGenerator(prefix) {
  const id = ref(null);

  id.value = `${prefix}${getRandomId()}`;

  return {id};
}
