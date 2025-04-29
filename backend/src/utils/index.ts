// src/utils/validateEnumValue.ts
export function isValidEnumValue<T extends object>(
  enumObj: T,
  value: any
): value is T[keyof T] {
  return Object.values(enumObj).includes(value);
}
