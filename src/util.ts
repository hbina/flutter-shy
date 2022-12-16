import axios from "axios";
import { OpenAPIV3 } from "openapi-types";

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

export const resolveRefComponents = async (
  referenceDocument: OpenAPIV3.Document,
  value: any
): Promise<any> => {
  if (typeof value === "object" && value !== null) {
    if (typeof value["$ref"] === "string") {
      if (value["$ref"].startsWith("#")) {
        const reference = value["$ref"].split("/");
        reference.shift();
        let resolvedObject = referenceDocument;
        reference.forEach((key) => {
          resolvedObject = (resolvedObject as any)[key];
        });
        const result = await resolveRefComponents(
          referenceDocument,
          resolvedObject
        );
        return result;
      } else if (
        value["$ref"].startsWith("http://") ||
        value["$ref"].startsWith("https://")
      ) {
        const resolvedObject = await axios
          .get(value["$ref"])
          .then((v) => v.data)
          .catch(() => ({}));
        return await resolveRefComponents(referenceDocument, resolvedObject);
      }
    } else {
      if (Array.isArray(value)) {
        const result = await Promise.all(
          value.map((v) => resolveRefComponents(referenceDocument, v))
        );
        return result;
      } else {
        const arr = await Promise.all(
          Object.entries(value).map(async ([k, v]) =>
            resolveRefComponents(referenceDocument, v).then((a) => [k, a])
          )
        );
        const result = Object.fromEntries(arr);
        return result;
      }
    }
  } else {
    return value;
  }
};

// TODO: Implement this conversion.
export const resolveValidationSchema = (
  methodDetails: ResolvedOpenApiV3.OperationObject
) => {
  return undefined;
};
