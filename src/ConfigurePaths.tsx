import { AxiosInstance } from "axios";
import { Formik, FormikErrors, FormikProps, FormikTouched } from "formik";
import { cloneDeep, isEmpty, omitBy } from "lodash";
import { useState } from "react";
import { SchemaViewer } from "./SchemaVIewer";
import { CIRCULAR_BOX } from "./styles";
import { ResolvedOpenApiV3 } from "./types";

import { resolvePathTemplate, resolveValidationSchema } from "./util";

export const ConfigurePaths = ({
  pathObjects,
  axiosInstance,
}: {
  pathObjects: ResolvedOpenApiV3.PathsObject;
  axiosInstance: AxiosInstance;
}) => {
  const [response, setResponse] = useState<any | undefined>(undefined);

  const paths = Object.fromEntries(
    Object.entries(pathObjects).map(([path, pathDetails]) => [
      path,
      {
        [ResolvedOpenApiV3.HttpMethods.GET]: pathDetails?.get,
        [ResolvedOpenApiV3.HttpMethods.PUT]: pathDetails?.put,
        [ResolvedOpenApiV3.HttpMethods.POST]: pathDetails?.post,
        [ResolvedOpenApiV3.HttpMethods.DELETE]: pathDetails?.delete,
        [ResolvedOpenApiV3.HttpMethods.OPTIONS]: pathDetails?.options,
        [ResolvedOpenApiV3.HttpMethods.HEAD]: pathDetails?.head,
        [ResolvedOpenApiV3.HttpMethods.PATCH]: pathDetails?.patch,
        [ResolvedOpenApiV3.HttpMethods.TRACE]: pathDetails?.trace,
      },
    ])
  );
  const [visibles, setVisibles] = useState(
    Object.entries(pathObjects).map(() => false)
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: "10px",
      }}
    >
      {Object.entries(paths).map(([pathTemplate, pathDetails], idx) => (
        <div
          key={pathTemplate}
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
            {pathTemplate}
          </button>
          {visibles[idx] &&
            Object.entries(pathDetails).map(
              ([method, methodDetails]) =>
                methodDetails && (
                  <MethodRow
                    key={method}
                    axiosInstance={axiosInstance}
                    pathTemplate={pathTemplate}
                    method={method}
                    methodDetails={methodDetails}
                    response={response}
                    setResponse={setResponse}
                  />
                )
            )}
        </div>
      ))}
    </div>
  );
};

type RequestSetting = { in: string; value: string };

const MethodRow = ({
  axiosInstance,
  pathTemplate,
  method,
  methodDetails,
  response,
  setResponse,
}: {
  axiosInstance: AxiosInstance;
  pathTemplate: string;
  method: string;
  methodDetails: ResolvedOpenApiV3.OperationObject;
  response: any | undefined;
  setResponse: React.SetStateAction<any | undefined>;
}) => {
  return (
    <Formik
      key={method}
      onSubmit={async (value: Record<string, RequestSetting>) => {
        try {
          const resolvedPathTemplate = resolvePathTemplate(
            pathTemplate,
            Object.fromEntries(
              Object.entries(
                omitBy(value, (v) => v.in !== "path" || isEmpty(v.value))
              ).map(([k, v]) => [k.substring("parameter-".length), v.value])
            ),
            Object.fromEntries(
              Object.entries(
                omitBy(value, (v) => v.in !== "query" || isEmpty(v.value))
              ).map(([k, v]) => [k.substring("parameter-".length), v.value])
            )
          );
          switch (method) {
            case ResolvedOpenApiV3.HttpMethods.GET: {
              axiosInstance
                .get(resolvedPathTemplate)
                .then((v) => setResponse(v))
                .catch((v) => setResponse(v));
              break;
            }
            case ResolvedOpenApiV3.HttpMethods.POST: {
              axiosInstance
                .post(
                  resolvedPathTemplate,
                  JSON.parse(value["request-body"]?.value)
                )
                .then((v) => setResponse(v))
                .catch((v) => setResponse(v));
              break;
            }
            case ResolvedOpenApiV3.HttpMethods.DELETE: {
              axiosInstance
                .delete(resolvedPathTemplate)
                .then((v) => setResponse(v))
                .catch((v) => setResponse(v));
              break;
            }
            case ResolvedOpenApiV3.HttpMethods.PUT: {
              axiosInstance
                .put(
                  resolvedPathTemplate,
                  JSON.parse(value["request-body"]?.value)
                )
                .then((v) => setResponse(v))
                .catch((v) => setResponse(v));
              break;
            }
            default: {
              console.error(`HTTP method ${method} is not supported`);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }}
      initialValues={{}}
      validationSchema={resolveValidationSchema(methodDetails)}
    >
      {({
        values,
        errors,
        touched,
        setTouched,
        setFieldValue,
        handleChange,
        submitForm,
      }: FormikProps<Record<string, RequestSetting>>) => (
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
                disabled={Object.entries(errors).length !== 0}
                type="submit"
                onClick={submitForm}
              >
                Submit
              </button>
            </div>
          </div>
          <ParameterRow
            values={values}
            errors={errors}
            touched={touched}
            methodDetails={methodDetails}
            setFieldValue={setFieldValue}
            setTouched={setTouched}
          />
          <RequestBodyRow
            values={values}
            methodDetails={methodDetails}
            setFieldValue={setFieldValue}
          />
          <ResponseBodyRow response={response} />
        </div>
      )}
    </Formik>
  );
};

export const ParameterRow = ({
  values,
  errors,
  touched,
  setFieldValue,
  setTouched,
  methodDetails,
}: {
  values: Record<string, RequestSetting>;
  errors: FormikErrors<Record<string, RequestSetting>>;
  touched: FormikTouched<Record<string, RequestSetting>>;
  setFieldValue: (a: string, b: RequestSetting) => void;
  setTouched: (
    a: FormikTouched<Record<string, RequestSetting>>,
    b: boolean | undefined
  ) => void;
  methodDetails: ResolvedOpenApiV3.OperationObject;
}) => (
  <div style={CIRCULAR_BOX}>
    <div>Parameters</div>
    {methodDetails?.parameters && (
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
          {methodDetails.parameters.map((param, idx, arr) => {
            return (
              <tr
                key={idx}
                style={{
                  borderBottom: idx === arr.length - 1 ? "" : "1px solid black",
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
                          {param.schema &&
                            (param.schema.format
                              ? `${param.schema.format} ${param.schema.type}`
                              : `${param.schema.type}`)}
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
                      id="text"
                      name={`parameter-${param.name}`}
                      type="text"
                      onChange={(v) => {
                        setFieldValue(`parameter-${param.name}`, {
                          in: param.in,
                          value: v.target.value,
                        });
                        setTouched(
                          {
                            ...touched,
                            [`parameter-${param.name}`]: true,
                          } as any,
                          false
                        );
                      }}
                      value={values[`parameter-${param.name}`]?.value ?? ""}
                    />
                    {errors[`parameter-${param.name}`] &&
                    touched[`parameter-${param.name}`] ? (
                      <div
                        style={{
                          color: "red",
                        }}
                      >
                        {errors[`parameter-${param.name}`]?.value}
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
    {!methodDetails?.parameters && <>No parameters</>}
  </div>
);

export const RequestBodyRow = ({
  values,
  setFieldValue,
  methodDetails,
}: {
  values: Record<string, RequestSetting>;
  setFieldValue: (a: string, b: RequestSetting) => void;
  methodDetails: ResolvedOpenApiV3.OperationObject;
}) => {
  return (
    <div style={CIRCULAR_BOX}>
      <div>Request Body</div>
      {methodDetails?.requestBody && (
        <div>
          <>{methodDetails?.requestBody.description}</>
          <>{methodDetails?.requestBody.required}</>
          <>
            {Object.entries(methodDetails?.requestBody.content).map(
              ([k, v]) => (
                <div key={k}>
                  <div>{k}</div>
                  <div>{JSON.stringify(v.schema)}</div>
                  <div>
                    {v.schema && (
                      <SchemaViewer
                        value={v.schema}
                        style={{
                          ...CIRCULAR_BOX,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      />
                    )}
                    {!!!v.schema && <>No Schema</>}
                  </div>
                </div>
              )
            )}
          </>
        </div>
      )}
      {!methodDetails?.requestBody && <>No Request Body</>}
    </div>
  );
};

export const ResponseBodyRow = ({
  response,
}: {
  response: any | undefined;
}) => {
  return (
    <div style={CIRCULAR_BOX}>
      <div>Response Body</div>
      {response && <div>{JSON.stringify(response, null, 4)}</div>}
    </div>
  );
};
