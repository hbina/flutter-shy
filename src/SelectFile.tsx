import React from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import { load_openapi_definition } from "./backend";
import { OpenApiSchema, ReactSetState, ReactState } from "./types";

export const FILE_SELECT_SCHEMA = Yup.object({
  fileContent: Yup.object().nullable(),
}).required();

export const SelectFile = ({
  setSchema,
}: {
  setSchema: ReactSetState<undefined | OpenApiSchema>;
}) => {
  return (
    <Formik
      initialValues={{ fileContent: "" }}
      onSubmit={async (values, actions) => {
        try {
          setSchema(undefined);
          const object = (await load_openapi_definition({
            content: values.fileContent,
          })) as any;
          setSchema(object);
        } catch (e) {
          console.log(e);
        }
      }}
      validationSchema={FILE_SELECT_SCHEMA}
    >
      {({ setFieldValue, status, errors, touched }) => (
        <Form>
          <input
            id="fileContent"
            type="file"
            onChange={async (v) => {
              const reader = new FileReader();
              reader.onloadend = (e) => {
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
  );
};
