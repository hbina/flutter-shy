import "bootstrap/dist/css/bootstrap.min.css";

import { useState } from "react";

import { SelectFile } from "./SelectFile";

const tableBorder = {
  border: "1px solid black",
  borderCollapse: "collapse",
  padding: "2px",
  margin: "3px",
};
const compactTableBorder = {
  border: "1px solid black",
  borderCollapse: "collapse",
};
const errorDivStyle = {
  backgroundColor: "red",
};

const App = () => {
  const [swaggerInfo, setSwaggerInfo] = useState(undefined);
  const [fileError, setFileError] = useState(undefined);
  const [curlState, setCurlState] = useState({});
  // const componentsInfo = getComponentsInfoFromSwaggerInfo(swaggerInfo);
  const componentsInfo = swaggerInfo?.componentsInfo ?? {};

  // console.log("componentsInfo", componentsInfo);
  usePageTitle(swaggerInfo?.title);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SelectFile setFileContent={setSwaggerInfo} setFileError={setFileError} />
      <div>
        {fileError === undefined ? null : (
          <p>{`Cannot parse the file as a swagger because ${fileError}`}</p>
        )}
      </div>
      <p>{swaggerInfo?.title ?? "no title"}</p>
      {swaggerInfo === undefined ? null : (
        <PathsDiv
          curlState={curlState}
          setCurlState={setCurlState}
          paths={swaggerInfo?.doc?.paths ?? {}}
          componentsInfo={componentsInfo}
        />
      )}
    </div>
  );
};

const PathsDiv = ({ curlState, setCurlState, paths, componentsInfo }) => {
  return (
    <div id={"paths-div"}>
      {Object.entries(paths).map(([pathName, methods]) => {
        // TODO(hanif) - Validate that its a string
        return (
          <div key={`${pathName}`} style={tableBorder}>
            <PathDiv
              curlState={curlState}
              setCurlState={setCurlState}
              pathName={pathName}
              methods={methods}
              componentsInfo={componentsInfo}
            />
          </div>
        );
      })}
    </div>
  );
};

const PathDiv = ({
  curlState,
  setCurlState,
  pathName,
  methods,
  componentsInfo,
}) => {
  return (
    <div id={`path-div-${pathName}`}>
      <p>{pathName}</p>
      <div style={tableBorder}>
        {Object.entries(methods).map(([methodName, methodObject]) => {
          return (
            <div key={`${methodName}`}>
              <MethodDiv
                curlPath={`${pathName}-${methodName}`}
                curlState={curlState}
                setCurlState={setCurlState}
                methodName={methodName}
                methodObject={methodObject}
                componentsInfo={componentsInfo}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MethodDiv = ({
  curlPath,
  curlState,
  setCurlState,
  methodName,
  methodObject,
  componentsInfo,
}) => {
  if (typeof methodName !== "string") {
    return (
      <div
        id={`method-div-error`}
        style={errorDivStyle}
      >{`Unable to render MethodDiv because 'method' is not a string`}</div>
    );
  }
  return (
    <div
      id={`method-div-${methodName}`}
      key={`${methodName}`}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <div id={`method-div-title`}>{methodName}</div>
      <div id={`method-div-detail`}>
        {methodObject.operationId === undefined ||
        methodObject.operationId === "" ? null : (
          <div id={`method-div-detail-operation-id`} style={tableBorder}>
            {methodObject.operationId}
          </div>
        )}
        {methodObject.summary === undefined ||
        methodObject.summary === "" ? null : (
          <div id={`method-div-detail-summary`} style={tableBorder}>
            {methodObject.summary}
          </div>
        )}

        {methodObject.description === undefined ||
        methodObject.description === "" ? null : (
          <div id={`method-div-detail-description`} style={tableBorder}>
            {methodObject.description.split("\n").map((v, idx) => (
              <div key={idx}>{v}</div>
            ))}
          </div>
        )}
        <ParametersDiv
          curlPath={curlPath}
          setCurlState={setCurlState}
          parameters={methodObject?.parameters ?? []}
          componentsInfo={componentsInfo}
        />
        <ResponseDiv responses={methodObject?.responses ?? {}} />
        <CurlDiv curlPath={curlPath} curlState={curlState} />
      </div>
    </div>
  );
};

const ResponseDiv = ({ responses }) => {
  return (
    <div id={"response-div"} style={tableBorder}>
      {Object.entries(responses).map(([httpCode, { description }]) => (
        <div
          id={`response-div-${httpCode}`}
          key={`${httpCode}`}
          style={{
            ...tableBorder,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            // gap: "5px",
          }}
        >
          <div>{`${httpCode} ${description}`}</div>
        </div>
      ))}
    </div>
  );
};

const ParametersDiv = ({
  curlPath,
  setCurlState,
  parameters,
  componentsInfo,
}) => {
  const result = parameters.map((parameter) => {
    if (typeof parameter["$ref"] === "string") {
      const vRef = parameter["$ref"];
      if (componentsInfo[vRef] === undefined) {
        return (
          <div
            id={`parameter-div-error-${vRef}`}
            style={errorDivStyle}
          >{`Cannot find ref component '${vRef}' in the componentsInfo`}</div>
        );
      } else if (typeof componentsInfo[vRef] !== "object") {
        return (
          <div
            id={`parameter-div-error-${vRef}`}
            style={errorDivStyle}
          >{`The value at '${vRef}' in the componentsInfo is not an object`}</div>
        );
      } else {
        // TODO(hanif) - How to render this?
        return (
          <ParameterDiv
            curlPath={curlPath}
            setCurlState={setCurlState}
            id={`parameter-div-${vRef}`}
            parameter={componentsInfo[vRef]}
          />
        );
      }
    } else {
      return (
        <ParameterDiv
          curlPath={curlPath}
          setCurlState={setCurlState}
          parameter={parameter}
        />
      );
    }
  });
  return result;
};

const ParameterDiv = ({ curlPath, setCurlState, parameter }) => {
  return (
    <div
      id={`parameter-div-${parameter.name}`}
      key={`${parameter.name}`}
      style={{
        ...tableBorder,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        // gap: "5px",
      }}
    >
      <div id={`parameter-div-name`} style={tableBorder}>
        {parameter.name}
      </div>
      <div
        id={`parameter-div-detail`}
        style={{
          ...tableBorder,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {typeof parameter.in === "string" ? (
          <div id={`parameter-div-detail-in`} style={tableBorder}>
            {parameter.in}
          </div>
        ) : (
          <div id={`parameter-div-detail-in-error`} style={errorDivStyle}>
            {typeof parameter.in}
          </div>
        )}
        {typeof parameter.description === "string" ? (
          <div id={`parameter-div-detail-description`} style={tableBorder}>
            {parameter.description.split("\n").map((line, idx) => (
              <div
                id={`parameter-div-detail-description-line-${idx}`}
                key={idx}
              >
                {line}
              </div>
            ))}
          </div>
        ) : null}
        <SchemaDiv
          curlPath={curlPath}
          setCurlState={setCurlState}
          name={parameter.name}
          schemaObject={parameter.schema}
        />
      </div>
    </div>
  );
};

export const SchemaDiv = ({ curlPath, setCurlState, name, schemaObject }) => {
  if (typeof schemaObject !== "object") {
    return (
      <div
        id={`schema-div-error`}
        style={errorDivStyle}
      >{`The schemaObject of type '${typeof schemaObject}' is not yet supported`}</div>
    );
  } else if (typeof schemaObject.type === "string") {
    const id = `schema-div-${schemaObject.type}-${name}`;
    if (schemaObject.type === "string") {
      return (
        <div id={id} style={tableBorder}>
          <div>string</div>
          <input
            type="text"
            name={id}
            onChange={(v) => {
              if (typeof v?.target?.value === "string") {
                setCurlState((oldS) => {
                  const s = JSON.parse(JSON.stringify(oldS));
                  if (s[curlPath] === undefined) {
                    s[curlPath] = {};
                  }
                  s[curlPath][name] = v?.target?.value;
                  return s;
                });
              } else {
                console.log(
                  `id='${id}' expected string from text input but got ${typeof v
                    ?.target?.value}`,
                  v?.target?.value
                );
              }
            }}
          />
        </div>
      );
    } else if (schemaObject.type === "boolean") {
      return (
        <div id={id} style={tableBorder}>
          <div>boolean</div>
          <select
            onChange={(v) => {
              if (typeof v?.target?.value === "string") {
                setCurlState((oldS) => {
                  const s = JSON.parse(JSON.stringify(oldS));
                  if (s[curlPath] === undefined) {
                    s[curlPath] = {};
                  }
                  s[curlPath][name] =
                    v?.target?.value === "true" ? true : false;
                  return s;
                });
              } else {
                console.log(
                  `id='${id}' expected string from text input but got ${typeof v
                    ?.target?.value}`,
                  v?.target?.value
                );
              }
            }}
          >
            <option value={true}>True</option>
            <option value={false}>False</option>
          </select>
        </div>
      );
    } else if (schemaObject.type === "integer") {
      return (
        <div id={id} style={tableBorder}>
          <div>integer</div>
          <input
            type="number"
            name={id}
            onChange={(v) => {
              if (typeof v?.target?.value === "string") {
                setCurlState((oldS) => {
                  const s = JSON.parse(JSON.stringify(oldS));
                  if (s[curlPath] === undefined) {
                    s[curlPath] = {};
                  }
                  s[curlPath][name] = parseInt(v?.target?.value);
                  return s;
                });
              } else {
                console.log(
                  `id='${id}' expected string from text input but got ${typeof v
                    ?.target?.value}`,
                  v?.target?.value
                );
              }
            }}
          />
        </div>
      );
    } else {
      return (
        <div
          id={`schema-div-error`}
          style={errorDivStyle}
        >{`The schema of type '${schemaObject.type}' is not yet supported`}</div>
      );
    }
  } else {
    return (
      <div
        id={`schema-div-error`}
        style={errorDivStyle}
      >{`Unable to render SchemaDiv because 'type' is a ${typeof schemaObject.type}`}</div>
    );
  }
};

const CurlDiv = ({ curlPath, curlState }) => {
  if (typeof curlState !== "object") {
    return (
      <div
        id={`curl-div-error`}
        style={errorDivStyle}
      >{`'curlState' should be an object but it is an ${typeof curlState}`}</div>
    );
  } else if (curlState[curlPath] === undefined) {
    return <div>{curlPath}</div>;
  } else {
    const queries = Object.entries(curlState[curlPath])
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    return <div>{`${curlPath}?${queries}`}</div>;
  }
};

const usePageTitle = (title) => {
  if (typeof title === "string") {
    document.title = `${title}`;
  } else if (title === undefined) {
    document.title = `flutter-shy - nodoc`;
  } else {
    console.log("received unknown type for title:", typeof title);
  }
};

export default App;
