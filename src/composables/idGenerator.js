import { ref } from 'vue';

const hasCrypto = () => typeof crypto !== 'undefined' && crypto && crypto.randomUUID;

const getRandomId = () => {
  if (hasCrypto()){
    return crypto.randomUUID();
  }

  return `${Date.now().toString(32)}-${Math.random().toString(36).substring(2)}`;
};

export function useIdGenerator(prefix) {
  const id = ref(null);

  id.value = `${prefix}${getRandomId()}`;

  return {id};
}
