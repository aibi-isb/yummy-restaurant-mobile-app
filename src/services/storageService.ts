import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

export async function setJson<T>(key: string, value: T): Promise<T> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}

export async function updateJson<T>(
  key: string,
  fallback: T,
  updater: (current: T) => T
): Promise<T> {
  const current = await getJson(key, fallback);
  return setJson(key, updater(current));
}
