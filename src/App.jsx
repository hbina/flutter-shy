import "bootstrap/dist/css/bootstrap.min.css";

import { useState, memo } from "react";

import { SelectFile } from "./SelectFile";

const tableBorder = {
  border: "1px solid black",
  borderCollapse: "collapse",
  padding: "2px",
  margin: "3px",
};
const errorDivStyle = {
  backgroundColor: "red",
};

const App = () => {
  const [swaggerInfo, setSwaggerInfo] = useState(undefined);
  const [fileError, setFileError] = useState(undefined);
  const [baseUrl, setBaseUrl] = useState("");
  const [curlState, setCurlState] = useState({});
  // const componentsInfo = getComponentsInfoFromSwaggerInfo(swaggerInfo);
  const componentsInfo = swaggerInfo?.componentsInfo ?? {};
  const servers = swaggerInfo?.servers ?? [];

  console.log("curlState", curlState);

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
      <div>
        {swaggerInfo?.title === undefined
          ? "Title:"
          : `Title: ${swaggerInfo?.title}`}
      </div>
      {servers.length !== 0 ? (
        <select
          onChange={(v) => {
            setBaseUrl(v.target.value);
          }}
        >
          <option key="empty" value=""></option>
          {servers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ) : (
        <select>
          <option key="empty" value=""></option>
        </select>
      )}
      <div>{`Using server: ${baseUrl}`}</div>
      {swaggerInfo === undefined ? null : (
        <PathsDiv
          baseUrl={baseUrl}
          curlState={curlState}
          setCurlState={setCurlState}
          paths={swaggerInfo?.doc?.paths ?? {}}
          componentsInfo={componentsInfo}
        />
      )}
    </div>
  );
};

const PathsDiv = ({
  baseUrl,
  curlState,
  setCurlState,
  paths,
  componentsInfo,
}) => {
  return (
    <div
    //  id={"paths-div"}
    >
      {Object.entries(paths).map(([pathName, methods]) => {
        // TODO(hanif) - Validate that its a string
        return (
          <div key={pathName} style={tableBorder}>
            <details>
              <summary>{pathName}</summary>
              <PathDiv
                baseUrl={baseUrl}
                curlState={curlState}
                setCurlState={setCurlState}
                pathName={pathName}
                methods={methods}
                componentsInfo={componentsInfo}
              />
            </details>
          </div>
        );
      })}
    </div>
  );
};

const MemoPathDiv = memo(
  ({ baseUrl, curlState, setCurlState, pathName, methods, componentsInfo }) => {
    return (
      <PathDiv
        baseUrl={baseUrl}
        curlState={curlState}
        setCurlState={setCurlState}
        pathName={pathName}
        methods={methods}
        componentsInfo={componentsInfo}
      />
    );
  }
);

const PathDiv = ({
  baseUrl,
  curlState,
  setCurlState,
  pathName,
  methods,
  componentsInfo,
}) => {
  return (
    <div
    //  id={`path-div-${pathName}`}
    >
      <p>{pathName}</p>
      <div style={tableBorder}>
        {Object.entries(methods).map(([methodName, methodObject]) => {
          // setCurlState((oldS) => {
          //   const s = JSON.parse(JSON.stringify(oldS));
          //   if (s[methodName] === undefined) {
          //     s[methodName] = {};
          //   }
          //   if (s[methodName][pathName] === undefined) {
          //     s[methodName][pathName] = {};
          //   }
          //   return s;
          // });
          return (
            <div key={`${methodName}`}>
              <MethodDiv
                baseUrl={baseUrl}
                pathName={pathName}
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
  baseUrl,
  pathName,
  curlState,
  setCurlState,
  methodName,
  methodObject,
  componentsInfo,
}) => {
  if (typeof methodName !== "string") {
    return (
      <div
        // id={`method-div-error`}
        style={errorDivStyle}
      >{`Unable to render MethodDiv because 'method' is not a string`}</div>
    );
  }
  return (
    <div
      // id={`method-div-${pathName}`}
      key={`${methodName}`}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <div
      //  id={`method-div-${pathName}-title`}
      >
        {methodName}
      </div>
      <div
      //  id={`method-div-${pathName}-detail`}
      >
        {methodObject.operationId === undefined ||
        methodObject.operationId === "" ? null : (
          <div
            // id={`method-div-${pathName}-detail-operation-id`}
            style={tableBorder}
          >
            {methodObject.operationId}
          </div>
        )}
        {methodObject.summary === undefined ||
        methodObject.summary === "" ? null : (
          <div
            // id={`method-div-${pathName}-detail-summary`}
            style={tableBorder}
          >
            {methodObject.summary}
          </div>
        )}

        {methodObject.description === undefined ||
        methodObject.description === "" ? null : (
          <div
            // id={`method-div-${pathName}-detail-description`}
            style={tableBorder}
          >
            {methodObject.description.split("\n").map((v, idx) => (
              <div key={idx}>{v}</div>
            ))}
          </div>
        )}
        <ParametersDiv
          methodName={methodName}
          pathName={pathName}
          setCurlState={setCurlState}
          parameters={methodObject?.parameters ?? []}
          componentsInfo={componentsInfo}
        />
        <ResponsesDiv responses={methodObject?.responses ?? {}} />
        <CurlDiv
          baseUrl={baseUrl}
          methodName={methodName}
          pathName={pathName}
          curlState={curlState}
        />
      </div>
    </div>
  );
};

const ResponsesDiv = ({ responses }) => {
  return (
    <div style={tableBorder}>
      {Object.entries(responses).map(([httpCode, { description }]) => (
        <div
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
  methodName,
  pathName,
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
            key={`parameter-div-${vRef}`}
            // id={`parameter-div-error-${vRef}`}
            style={errorDivStyle}
          >{`Cannot find ref component '${vRef}' in the componentsInfo`}</div>
        );
      } else if (typeof componentsInfo[vRef] !== "object") {
        return (
          <div
            key={`parameter-div-${vRef}`}
            // id={`parameter-div-error-${vRef}`}
            style={errorDivStyle}
          >{`The value at '${vRef}' in the componentsInfo is not an object`}</div>
        );
      } else {
        // TODO(hanif) - How to render this?
        return (
          <div key={`parameter-div-${vRef}`}>
            <ParameterDiv
              methodName={methodName}
              pathName={pathName}
              setCurlState={setCurlState}
              parameter={componentsInfo[vRef]}
            />
          </div>
        );
      }
    } else {
      return (
        <ParameterDiv
          methodName={methodName}
          pathName={pathName}
          setCurlState={setCurlState}
          parameter={parameter}
        />
      );
    }
  });
  return result;
};

const ParameterDiv = ({ methodName, pathName, setCurlState, parameter }) => {
  return (
    <div
      // id={`parameter-div-${parameter.name}`}
      key={`${parameter.name}`}
      style={{
        ...tableBorder,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        // gap: "5px",
      }}
    >
      <div
        // id={`parameter-div-name`}
        style={tableBorder}
      >
        {parameter.name}
      </div>
      <div
        // id={`parameter-div-detail`}
        style={{
          ...tableBorder,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {typeof parameter.in === "string" ? (
          <div
            // id={`parameter-div-detail-in`}
            style={tableBorder}
          >
            {parameter.in}
          </div>
        ) : (
          <div
            // id={`parameter-div-detail-in-error`}
            style={errorDivStyle}
          >
            {typeof parameter.in}
          </div>
        )}
        {typeof parameter.description === "string" ? (
          <div
            //  id={`parameter-div-detail-description`}
            style={tableBorder}
          >
            {parameter.description.split("\n").map((line, idx) => (
              <div
                // id={`parameter-div-detail-description-line-${idx}`}
                key={idx}
              >
                {line}
              </div>
            ))}
          </div>
        ) : null}
        <SchemaDiv
          methodName={methodName}
          pathName={pathName}
          setCurlState={setCurlState}
          name={parameter.name}
          schemaObject={parameter.schema}
        />
      </div>
    </div>
  );
};

const handleInputChange = ({ methodName, pathName, name, setCurlState, v }) => {
  if (typeof v?.target?.value === "string") {
    setCurlState((oldS) => {
      const s = JSON.parse(JSON.stringify(oldS));
      if (s[methodName] === undefined) {
        s[methodName] = {};
      }
      if (s[methodName][pathName] === undefined) {
        s[methodName][pathName] = {};
      }
      s[methodName][pathName][name] = v?.target?.value;
      return s;
    });
  }
};

const SchemaDiv = ({
  methodName,
  pathName,
  setCurlState,
  name,
  schemaObject,
}) => {
  if (typeof schemaObject !== "object") {
    return (
      <div
        // id={`schema-div-error`}
        style={errorDivStyle}
      >{`The schemaObject of type '${typeof schemaObject}' is not yet supported`}</div>
    );
  } else if (typeof schemaObject.type === "string") {
    const id = `schema-div-${schemaObject.type}-${name}`;
    if (schemaObject.type === "string") {
      return (
        <div
          //  id={id}
          style={tableBorder}
        >
          <div>string</div>
          <input
            type="text"
            name={id}
            onChange={(v) =>
              handleInputChange({ methodName, pathName, setCurlState, name, v })
            }
          />
        </div>
      );
    } else if (schemaObject.type === "boolean") {
      return (
        <div
          // id={id}
          style={tableBorder}
        >
          <div>boolean</div>
          <select
            onChange={(v) =>
              handleInputChange({ methodName, pathName, setCurlState, name, v })
            }
          >
            <option value=""></option>
            <option value={true}>True</option>
            <option value={false}>False</option>
          </select>
        </div>
      );
    } else if (schemaObject.type === "integer") {
      return (
        <div
          // id={id}
          style={tableBorder}
        >
          <div>integer</div>
          <input
            type="number"
            name={id}
            onChange={(v) =>
              handleInputChange({ methodName, pathName, setCurlState, name, v })
            }
          />
        </div>
      );
    } else {
      return (
        <div
          // id={`schema-div-error`}
          style={errorDivStyle}
        >{`The schema of type '${schemaObject.type}' is not yet supported`}</div>
      );
    }
  } else {
    return (
      <div
        // id={`schema-div-error`}
        style={errorDivStyle}
      >{`Unable to render SchemaDiv because 'type' is a ${typeof schemaObject.type}`}</div>
    );
  }
};

const CurlDiv = ({ baseUrl, methodName, pathName, curlState }) => {
  if (typeof curlState !== "object") {
    return (
      <div
        // id={`curl-div-error`}
        style={errorDivStyle}
      >{`'curlState' should be an object but it is an ${typeof curlState}`}</div>
    );
  } else if (curlState[methodName] === undefined) {
    return <div>{`Cannot find '${methodName}' in curlState`}</div>;
  } else if (curlState[methodName][pathName] === undefined) {
    return <div>{`Cannot find '${methodName}/${pathName}' in curlState`}</div>;
  } else {
    const queries = Object.entries(curlState[methodName][pathName])
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    return (
      <div>{`curl -X ${methodName.toUpperCase()} ${baseUrl}${pathName}?${queries}`}</div>
    );
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
