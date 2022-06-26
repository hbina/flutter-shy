import { yupToFormErrors } from "formik";
import { OpenAPIV3 } from "openapi-types";
import * as Yup from "yup";

import { ResolvedOpenApiV3 } from "./types";

export const resolveStringTemplate = (
  template: string,
  translation: Readonly<Record<string, string>>
) => {
  let resolvedPath = template;
  Object.entries(translation).forEach(([key, value]) => {
    resolvedPath = resolvedPath.replaceAll(`{${key}}`, `${value}`);
  });
  return resolvedPath;
};

export const resolvePathTemplate = (
  template: string,
  paths: Record<string, string>,
  queries: Record<string, string>
) => {
  let resolvedTemplate = template;
  Object.entries(paths).forEach(([k, v]) => {
    resolvedTemplate = resolvedTemplate.replaceAll(`{${k}}`, v);
  });
  const query = new URLSearchParams(queries);
  return `${resolvedTemplate}${
    Object.entries(queries).length === 0 ? "" : "?"
  }${query.toString()}`;
};

export const resolveRefComponents = (
  referenceDocument: OpenAPIV3.Document,
  value: any
): any => {
  if (typeof value === "object" && value !== null) {
    if (typeof value["$ref"] === "string") {
      const reference = value["$ref"].split("/");
      reference.shift();
      let resolvedObject = referenceDocument;
      reference.forEach((key) => {
        resolvedObject = (resolvedObject as any)[key];
      });
      return resolveRefComponents(referenceDocument, resolvedObject);
    } else {
      return Array.isArray(value)
        ? value.map((v) => resolveRefComponents(referenceDocument, v))
        : Object.fromEntries(
            Object.entries(value).map(([k, v]) => {
              return [k, resolveRefComponents(referenceDocument, v)];
            })
          );
    }
  } else {
    return value;
  }
};

export const resolveValidationSchema = (
  methodDetails: ResolvedOpenApiV3.OperationObject
) => {
  const shape = Object.fromEntries(
    (methodDetails.parameters ?? []).map((v) => {
      if (v.required === true) {
        if (v.schema) {
          return [
            `parameter-${v.name}`,
            Yup.object().shape({
              value: Yup.number().required(),
            }),
          ];
        } else {
          return [
            `parameter-${v.name}`,
            Yup.object().shape({
              value: Yup.number().required(),
            }),
          ];
        }
      } else {
        if (v.schema) {
          return [
            `parameter-${v.name}`,
            Yup.object().shape({
              value: Yup.number().required(),
            }),
          ];
        } else {
          return [
            `parameter-${v.name}`,
            Yup.object().shape({
              value: Yup.number().required(),
            }),
          ];
        }
      }
    })
  );
  return Yup.object().shape(shape);
};
