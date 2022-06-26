import { OpenAPIV3 } from "openapi-types";
import React from "react";

export type ReactSetState<T> = React.Dispatch<React.SetStateAction<T>>;
export type ReactState<T> = [T, ReactSetState<T>];

export enum AppPage {
  PATHS,
  SERVERS,
  AUTH,
}

export type Server = {
  templateUrl: string;
  resolvedUrl: string;
  variables: Record<string, OpenAPIV3.ServerVariableObject> | undefined;
  translation: Record<string, string>;
};

export namespace ResolvedOpenApiV3 {
  export type Document = {
    servers?: ServerObject[];
    paths: PathsObject;
  };
  export type ServerObject = {
    url: string;
    description?: string;
    variables?: {
      [variable: string]: ServerVariableObject;
    };
  };
  export type ServerVariableObject = {
    enum?: string[];
    default: string;
    description?: string;
  };
  export type PathsObject = {
    [pattern: string]: PathItemObject | undefined;
  };
  export enum HttpMethods {
    GET = "get",
    PUT = "put",
    POST = "post",
    DELETE = "delete",
    OPTIONS = "options",
    HEAD = "head",
    PATCH = "patch",
    TRACE = "trace",
  }
  export type PathItemObject = {
    [method in HttpMethods]?: OperationObject | undefined;
  };
  export type OperationObject = {
    tags?: string[];
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: ParameterObject[];
    requestBody?: RequestBodyObject;
    deprecated?: boolean;
    servers?: ServerObject[];
  };
  export type ParameterObject = ParameterBaseObject & {
    name: string;
    in: string;
  };
  export type ParameterBaseObject = {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: SchemaObject;
    example?: any;
  };
  type NonArraySchemaObjectType =
    | "boolean"
    | "object"
    | "number"
    | "string"
    | "integer";
  type ArraySchemaObjectType = "array";
  export type SchemaObject = ArraySchemaObject | NonArraySchemaObject;
  export type ArraySchemaObject = BaseSchemaObject & {
    type: ArraySchemaObjectType;
    items: SchemaObject;
  };
  export type NonArraySchemaObject = BaseSchemaObject & {
    type?: NonArraySchemaObjectType;
  };
  export type BaseSchemaObject = {
    title?: string;
    description?: string;
    format?: string;
    default?: any;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    additionalProperties?: boolean | SchemaObject;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];
    properties?: {
      [name: string]: SchemaObject;
    };
    allOf?: SchemaObject[];
    oneOf?: SchemaObject[];
    anyOf?: SchemaObject[];
    not?: SchemaObject;
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    example?: any;
    deprecated?: boolean;
  };
  export type RequestBodyObject = {
    description?: string;
    content: {
      [media: string]: MediaTypeObject;
    };
    required?: boolean;
  };
  export interface MediaTypeObject {
    schema?: SchemaObject;
    example?: any;
  }
}
