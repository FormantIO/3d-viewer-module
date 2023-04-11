export enum TYPES {
  FLOAT = "Float",
  INTEGER = "Integer",
  BOOLEAN = "Boolean",
  STRING = "String",
  ENUM = "Enum",
}

export type INPUT_TYPE = TYPES.FLOAT | TYPES.INTEGER | TYPES.STRING;

export type PropertyType =
  | TYPES.FLOAT
  | TYPES.INTEGER
  | TYPES.BOOLEAN
  | TYPES.STRING
  | TYPES.ENUM;
