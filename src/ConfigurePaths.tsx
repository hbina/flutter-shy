import { AxiosInstance } from "axios";
import { Formik, FormikErrors, FormikProps, FormikTouched } from "formik";
import { cloneDeep, isEmpty, omitBy } from "lodash";
import { useState } from "react";
import { ResolvedOpenApiV3 } from "./types";

import { resolvePathTemplate, resolveValidationSchema } from "./util";

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
  pathObjects,
  axiosInstance,
}: {
  pathObjects: ResolvedOpenApiV3.PathsObject;
  axiosInstance: AxiosInstance;
}) => {
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
}: {
  axiosInstance: AxiosInstance;
  pathTemplate: string;
  method: string;
  methodDetails: ResolvedOpenApiV3.OperationObject;
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
                .then((v) => console.log(v.status, v.data));
              break;
            }
            case ResolvedOpenApiV3.HttpMethods.POST: {
              axiosInstance
                .post(resolvedPathTemplate, JSON.parse(value["body"]?.value))
                .then((v) => console.log(v.status, v.data));
              break;
            }
            case ResolvedOpenApiV3.HttpMethods.DELETE: {
              axiosInstance
                .delete(resolvedPathTemplate)
                .then((v) => console.log(v.status, v.data));
              break;
            }
            case ResolvedOpenApiV3.HttpMethods.PUT: {
              axiosInstance
                .put(resolvedPathTemplate, JSON.parse(value["body"]?.value))
                .then((v) => console.log(v.status, v.data));
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
            handleChange={handleChange}
          />
          <RequestBodyRow
            values={values}
            methodDetails={methodDetails}
            setFieldValue={setFieldValue}
          />
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
  handleChange,
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
  handleChange: (e: React.ChangeEvent<any>) => void;
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
                  <div>{JSON.stringify(v)}</div>
                  <textarea
                    onChange={(e) => {
                      setFieldValue("body", {
                        in: "body",
                        value: e.target.value,
                      });
                    }}
                  />
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
