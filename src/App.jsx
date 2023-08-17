import "bootstrap/dist/css/bootstrap.min.css";

import { useState } from "react";

import { SelectFile } from "./SelectFile";

const tableBorder = {
  border: "1px solid black",
  borderCollapse: "collapse",
  padding: "5px",
};
const compactTableBorder = {
  border: "1px solid black",
  borderCollapse: "collapse",
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
        <PathDiv
          paths={swaggerInfo?.doc?.paths ?? {}}
          componentsInfo={componentsInfo}
        />
      )}
    </div>
  );
};

const PathDiv = ({ paths, componentsInfo }) => {
  return (
    <div>
      {Object.entries(paths).map(([path, methods]) => (
        <div key={`${path}`} style={tableBorder}>
          <p>{path}</p>
          <div style={tableBorder}>
            {Object.entries(methods).map(([method, parameter]) => {
              return (
                <div
                  key={`${method}`}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <div>{method}</div>
                  <div>
                    {parameter?.operationId === undefined ||
                    parameter.operationId == "" ? null : (
                      <div style={tableBorder}>
                        <div style={tableBorder}>{parameter.operationId}</div>
                      </div>
                    )}
                    <div style={tableBorder}>
                      <div style={tableBorder}>{parameter.summary}</div>
                    </div>
                    <div style={tableBorder}>
                      <div style={tableBorder}>
                        {typeof parameter.description !== "string"
                          ? null
                          : parameter.description
                              .split("\n")
                              .map((v, idx) => <div key={idx}>{v}</div>)}
                      </div>
                    </div>
                    <div style={tableBorder}>
                      <div style={tableBorder}>
                        {Object.entries(parameter?.responses ?? {}).map(
                          ([errorCode, { description }]) => (
                            <div
                              key={`${errorCode}`}
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <p>{errorCode}</p>
                              <p>{description}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div style={tableBorder}>
                      <ParameterDiv
                        parameter={parameter}
                        componentsInfo={componentsInfo}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const ParameterDiv = ({ parameter, componentsInfo }) => {
  const result = (parameter?.parameters ?? []).map((v) => {
    if (typeof v["$ref"] !== "string") {
      if (componentsInfo[v["$ref"]] !== undefined) {
        console.log("cannot find ", v["$ref"], "in the components info");
      } else {
        return (
          <div style={compactTableBorder}>{componentsInfo[v["$ref"]]}</div>
        );
      }
    } else {
      return (
        <div
          key={`${v.name}`}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <div>{v.name}</div>
          <div style={tableBorder}>
            <div style={compactTableBorder}>{v.in ?? "-"}</div>
            <div style={tableBorder}>
              {(v.description ?? "-").split("\n").map((v, idx) => (
                <div key={idx}>{v}</div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  });

  return result;
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
