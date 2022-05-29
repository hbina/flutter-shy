import { Formik, FormikProps } from "formik";
import { cloneDeep } from "lodash";
import { useState } from "react";
import Select from "react-select";
import { string } from "yup";
import * as _ from "lodash";

import { OpenApiSchema, OpenApiServers } from "./types";
import { resolveStringTemplate } from "./util";

const CIRCULAR_BOX: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderStyle: "inset",
  borderColor: "black",
  borderWidth: "1px",
  borderRadius: "5px",
  padding: "1px",
};

export const ConfigureServers = ({
  pServers,
}: {
  pServers: OpenApiServers | undefined;
}) => {
  const [servers, setServers] = useState(
    (pServers ?? []).map((v) => {
      const variables = v.variables ?? {};
      const translation = Object.fromEntries(
        Object.entries(variables).map(([k, v]) => [k, v.default])
      );
      const resolvedUrl = resolveStringTemplate(v.url, translation);
      return {
        templateUrl: v.url,
        resolvedUrl,
        variables,
        translation,
      };
    })
  );

  if (servers === undefined) {
    return <p>Schema does not have servers configured</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {servers.map(
        ({ templateUrl, resolvedUrl, variables, translation }, idx) => {
          return (
            <div key={templateUrl}>
              <ServerRow
                templateAddress={templateUrl}
                resolvedAddress={resolvedUrl}
                variables={variables}
                updateResolvedAddress={(key, value) => {
                  setServers((v) => {
                    const cloned = cloneDeep(v);
                    const server = cloned[idx];
                    server.translation[key] = value;
                    server.resolvedUrl = resolveStringTemplate(
                      server.templateUrl,
                      server.translation
                    );
                    return cloned;
                  });
                }}
              />
            </div>
          );
        }
      )}
    </div>
  );
};

const ServerRow = ({
  templateAddress,
  resolvedAddress,
  variables,
  updateResolvedAddress: updateTranslation,
}: {
  templateAddress: string;
  resolvedAddress: string;
  variables: Record<
    string,
    {
      default: string;
      description: string;
      enum: string[];
    }
  >;
  updateResolvedAddress: (key: string, value: string) => void;
}) => (
  <table>
    <tr>
      <td>Template: {templateAddress}</td>
    </tr>
    <tr>
      <td>Resolved: {resolvedAddress}</td>
    </tr>
    <tr>
      <td>
        <table>
          {Object.entries(variables).map(([variableKey, variableValue]) => (
            <tr key={variableKey}>
              <td>{variableKey}</td>
              <td>
                <table>
                  <tr>
                    <td>Default</td>
                    <td>{variableValue.default}</td>
                  </tr>
                  <tr>
                    <td>Description</td>
                    <td>{variableValue.description}</td>
                  </tr>
                  <tr>
                    <td>Enums</td>
                    <td>
                      <select
                        onChange={(input) => {
                          updateTranslation(variableKey, input.target.value);
                        }}
                      >
                        {variableValue.enum.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          ))}
        </table>
      </td>
    </tr>
  </table>
);
