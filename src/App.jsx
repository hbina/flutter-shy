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
  const componentsInfo = getComponentsInfoFromSwaggerInfo(swaggerInfo);

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
          paths={swaggerInfo?.doc?.paths ?? {}}
          componentsInfo={componentsInfo}
        />
      )}
    </div>
  );
};

const PathsDiv = ({ paths, componentsInfo }) => {
  return (
    <div id={"paths-div"}>
      {Object.entries(paths).map(([path, methods]) => (
        <PathDiv
          path={path}
          methods={methods}
          componentsInfo={componentsInfo}
        />
      ))}
    </div>
  );
};

const PathDiv = ({ path, methods, componentsInfo }) => {
  return (
    <div key={`${path}`} style={tableBorder}>
      <p>{path}</p>
      <div style={tableBorder}>
        {Object.entries(methods).map(([methodName, methodObject]) => {
          return (
            <MethodDiv
              methodName={methodName}
              methodObject={methodObject}
              componentsInfo={componentsInfo}
            />
          );
        })}
      </div>
    </div>
  );
};

const MethodDiv = ({ methodName, methodObject, componentsInfo }) => {
  if (typeof methodName !== "string") {
    return (
      <div>{`Unable to render MethodDiv because 'method' is not a string`}</div>
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
          parameters={methodObject?.parameters ?? []}
          componentsInfo={componentsInfo}
        />
        <ResponseDiv responses={methodObject?.responses ?? {}} />
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

const ParametersDiv = ({ parameters, componentsInfo }) => {
  const result = parameters.map((v) => {
    if (typeof v["$ref"] === "string") {
      const vRef = v["$ref"];
      if (componentsInfo[vRef] === undefined) {
        return (
          <div
            id={`parameter-div-error-${vRef}`}
            style={errorDivStyle}
          >{`Cannot find ref component '${vRef}' in the components info`}</div>
        );
      } else {
        // TODO(hanif) - How to render this?
        return (
          <div id={`parameter-div-${vRef}`} style={compactTableBorder}>
            {componentsInfo[vRef]}
          </div>
        );
      }
    } else {
      return (
        <div
          id={`parameter-div-${v.name}`}
          key={`${v.name}`}
          style={{
            ...tableBorder,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            // gap: "5px",
          }}
        >
          <div id={`parameter-div-name`} style={tableBorder}>
            {v.name}
          </div>
          <div
            id={`parameter-div-detail`}
            style={{
              ...tableBorder,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {typeof v.in === "string" ? (
              <div id={`parameter-div-detail-in`} style={tableBorder}>
                {v.in}
              </div>
            ) : (
              <div id={`parameter-div-detail-in-error`} style={errorDivStyle}>
                {typeof v.in}
              </div>
            )}
            {typeof v.description === "string" ? (
              <div id={`parameter-div-detail-description`} style={tableBorder}>
                {v.description.split("\n").map((v, idx) => (
                  <div
                    id={`parameter-div-detail-description-line-${idx}`}
                    key={idx}
                  >
                    {v}
                  </div>
                ))}
              </div>
            ) : null}
            <SchemaDiv schemaObject={v.schema} />
          </div>
        </div>
      );
    }
  });
  return result;
};

export const SchemaDiv = ({ name, schemaObject }) => {
  if (typeof schemaObject.type === "string") {
    if (schemaObject.type === "string") {
      const id = `${name}-string`;
      return (
        <div id={`schema-div-string`} style={tableBorder}>
          <div>string</div>
          <input id={id} type="text" name={id} />
        </div>
      );
    } else if (schemaObject.type === "boolean") {
      const id = `${name}-string`;
      return (
        <div id={`schema-div-string`} style={tableBorder}>
          <div>boolean</div>
          <select>
            <option value={true}>True</option>
            <option value={false}>False</option>
          </select>
        </div>
      );
    } else if (schemaObject.type === "integer") {
      const id = `${name}-string`;
      return (
        <div id={`schema-div-string`} style={tableBorder}>
          <div>integer</div>
          <input id={id} type="number" name={id} />
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

const getComponentsInfoFromSwaggerInfo = (swaggerInfo) => {
  const innerImpl = (obj, accPath, accResult) => {
    accResult[accPath] = obj;
    if (typeof obj === "object" && obj !== null) {
      // Means we have to dig deeper
      for (const [path, childObj] of Object.entries(obj)) {
        innerImpl(childObj, accPath + "/" + path, accResult);
      }
    }
  };

  const result = {};
  innerImpl(swaggerInfo?.doc?.components ?? {}, "#", result);
  return result;
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
