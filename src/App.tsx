import "bootstrap/dist/css/bootstrap.min.css";

import { Field, Form, Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { useState } from "react";

import { load_openapi_definition } from "./util";

const fileSelectSchema = Yup.object({
  fileContent: Yup.object().nullable(),
}).required();

const CIRCULAR_BOX: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderStyle: "inset",
  borderColor: "black",
  borderWidth: "1px",
  borderRadius: "5px",
  padding: "1px",
};

const App = () => {
  const [schema, setSchema] = useState<
    | undefined
    | {
        paths: Record<
          string,
          {
            get?: {
              operationId: string;
              parameters: {
                description: string;
                in: string;
                name: string;
                schema: {
                  format: string;
                  type: string;
                };
                required: boolean;
              }[];
            };
          }
        >;
      }
  >(undefined);
  return (
    <div>
      <Formik
        initialValues={{ fileContent: "" }}
        onSubmit={async (values, actions) => {
          console.log("values", values);
          console.log("actions", actions);
          try {
            const object = (await load_openapi_definition({
              content: values.fileContent,
            })) as any;
            setSchema(object);
          } catch (e) {
            console.log(e);
          }
        }}
        validationSchema={fileSelectSchema}
      >
        {({ setStatus, setFieldValue, status, errors, touched }) => (
          <Form>
            <input
              id="fileContent"
              type="file"
              onChange={async (v) => {
                const reader = new FileReader();
                reader.onloadend = (e) => {
                  setStatus(null);
                  setFieldValue(
                    "fileContent",
                    e.target?.result?.toString() ?? ""
                  );
                };
                v.target.files?.[0] && reader.readAsText(v.target.files[0]);
              }}
            />
            {errors.fileContent && touched.fileContent && (
              <div>{errors.fileContent}</div>
            )}
            {status && <div>{`${status}`}</div>}
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
      {schema && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            padding: "5px",
          }}
        >
          {Object.entries(schema.paths).map(([path, pathDetails]) => (
            <div
              key={path}
              style={{
                ...CIRCULAR_BOX,
                rowGap: "5px",
              }}
            >
              <div>{path}</div>
              {Object.entries(pathDetails).map(([method, methodDetails]) => (
                <Formik
                  key={method}
                  onSubmit={async (values, actions) => {
                    console.log("values", values);
                    console.log("actions", actions);
                  }}
                  validationSchema={fileSelectSchema}
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
                                        setFieldValue(
                                          param.name,
                                          v.target.value
                                        );
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
      )}
    </div>
  );
};

export default App;
