import { cloneDeep } from "lodash";
import { OpenAPIV3 } from "openapi-types";

import { ReactSetState, Server } from "./types";
import { resolveStringTemplate } from "./util";

export const ConfigureServers = ({
  servers,
  setServers,
  setBaseUrl,
}: {
  servers: Server[];
  setServers: ReactSetState<Server[]>;
  setBaseUrl: ReactSetState<string | undefined>;
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {servers.map(({ templateUrl, resolvedUrl, variables }, idx) => {
        return (
          <div key={templateUrl}>
            <ServerRow
              onClick={() => {
                setBaseUrl(resolvedUrl);
              }}
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
      })}
    </div>
  );
};

const ServerRow = ({
  templateAddress,
  resolvedAddress,
  variables,
  updateResolvedAddress: updateTranslation,
  onClick,
}: {
  templateAddress: string;
  resolvedAddress: string;
  variables: Record<string, OpenAPIV3.ServerVariableObject> | undefined;
  updateResolvedAddress: (key: string, value: string) => void;
  onClick: () => void;
}) => (
  <table>
    <tbody>
      <tr>
        <td>
          <button onClick={onClick}>Select</button>
        </td>
      </tr>
      <tr>
        <td>Template: {templateAddress}</td>
      </tr>
      <tr>
        <td>Resolved: {resolvedAddress}</td>
      </tr>
      <tr>
        <td>
          <table>
            <tbody>
              {variables !== undefined &&
                Object.entries(variables).map(
                  ([variableKey, variableValue]) => (
                    <tr key={variableKey}>
                      <td>{variableKey}</td>
                      <td>
                        <table>
                          <tbody>
                            <tr>
                              <td>Default</td>
                              <td>{variableValue.default}</td>
                            </tr>
                            <tr>
                              <td>Description</td>
                              <td>{variableValue.description}</td>
                            </tr>
                            {variableValue.enum !== undefined && (
                              <tr>
                                <td>Enums</td>
                                <td>
                                  <select
                                    onChange={(input) => {
                                      updateTranslation(
                                        variableKey,
                                        input.target.value
                                      );
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
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
);
