import { Formik, FormikProps } from "formik";
import { cloneDeep } from "lodash";
import { useState } from "react";

import { OpenApiPath } from "./types";

const CIRCULAR_BOX: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderStyle: "inset",
  borderColor: "black",
  borderWidth: "1px",
  borderRadius: "5px",
  padding: "1px",
};

export const ConfigurePaths = ({
  openApiPaths,
}: {
  openApiPaths: OpenApiPath;
}) => {
  const paths = Object.entries(openApiPaths).map(([path, pathDetails]) => ({
    path,
    pathDetails,
  }));
  const [visibles, setVisibles] = useState(
    Object.entries(openApiPaths).map(() => false)
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: "10px",
      }}
    >
      {paths.map(({ path, pathDetails }, idx) => (
        <div
          key={path}
          style={{
            ...CIRCULAR_BOX,
            rowGap: "5px",
          }}
        >
          <button
            onClick={() => {
              setVisibles((visibles) => {
                const newVisibles = cloneDeep(visibles);
                newVisibles[idx] = !newVisibles[idx];
                return newVisibles;
              });
            }}
          >
            {path}
          </button>
          {visibles[idx] === true &&
            Object.entries(pathDetails).map(([method, methodDetails]) => (
              <Formik
                key={method}
                onSubmit={async (v) => {
                  let finalPath = path;
                  Object.entries(v).forEach(([key, value]) => {
                    finalPath = finalPath.replaceAll(`{${key}}`, `${value}`);
                  });
                }}
                initialValues={{}}
              >
                {({ values, setFieldValue, submitForm }: FormikProps<any>) => (
                  <div
                    key={method}
                    style={{
                      ...CIRCULAR_BOX,
                    }}
                  >
                    <div
                      style={{
                        ...CIRCULAR_BOX,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        {method.toUpperCase()} - {methodDetails.operationId}
                      </div>
                      <div>
                        <button
                          type="submit"
                          onClick={() => {
                            submitForm();
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                    <div style={CIRCULAR_BOX}>
                      <div>Parameters</div>
                      {methodDetails?.parameters && (
                        <table>
                          <tr>
                            <th>Name</th>
                            <th>Description</th>
                          </tr>
                          {methodDetails.parameters.map((param, idx, arr) => (
                            <tr
                              key={idx}
                              style={{
                                borderBottom:
                                  idx === arr.length - 1
                                    ? ""
                                    : "1px solid black",
                              }}
                            >
                              <td>
                                <div>
                                  <div style={{ color: "red" }}>
                                    {param.required && "* required"}
                                  </div>
                                  <div>{param.name}</div>
                                  <div>
                                    <div>
                                      <div>
                                        {param.schema.format} (
                                        {param.schema.type})
                                      </div>
                                      <div>{param.in}</div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div>{param.description}</div>
                                  <input
                                    id="email"
                                    name={param.name}
                                    type="email"
                                    onChange={(v) => {
                                      setFieldValue(param.name, v.target.value);
                                    }}
                                    value={values[param.name] ?? ""}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </table>
                      )}
                      {!methodDetails?.parameters && <>No parameters</>}
                    </div>
                  </div>
                )}
              </Formik>
            ))}
        </div>
      ))}
    </div>
  );
};
