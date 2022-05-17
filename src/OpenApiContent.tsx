import { Formik, FormikProps } from "formik";
import { cloneDeep } from "lodash";
import { useState } from "react";

import { OpenApiSchema } from "./types";

const CIRCULAR_BOX: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderStyle: "inset",
  borderColor: "black",
  borderWidth: "1px",
  borderRadius: "5px",
  padding: "1px",
};

export const OpenApiContent = ({ schema }: { schema: OpenApiSchema }) => {
  const [paths, setPaths] = useState(
    Object.entries(schema.paths).map(([path, pathDetails]) => ({
      path,
      visible: false,
      pathDetails,
    }))
  );
  console.log("paths", paths);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: "10px",
        padding: "5px",
      }}
    >
      {paths.map(({ path, visible, pathDetails }, idx, arr) => (
        <div
          key={path}
          style={{
            ...CIRCULAR_BOX,
            rowGap: "5px",
          }}
        >
          <button
            onClick={() => {
              console.log("clicked on path", idx);
              setPaths((paths) => {
                const newPaths = cloneDeep(paths);
                paths[idx].visible = !paths[idx].visible;
                return newPaths;
              });
            }}
          >
            {path}
          </button>
          {visible &&
            Object.entries(pathDetails).map(([method, methodDetails]) => (
              <Formik
                key={method}
                onSubmit={async () => {
                  console.log("perform request");
                }}
                initialValues={{}}
              >
                {({
                  values,
                  setFieldValue,
                  setSubmitting,
                  submitForm,
                }: FormikProps<any>) => (
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
                        {method} - {methodDetails.operationId}
                      </div>
                      <div>
                        <button
                          type="submit"
                          onClick={(v) => {
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
