import React from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import YAML from "yaml";

import { ReactSetState } from "./types";
import { OpenAPIV3 } from "openapi-types";

export const FILE_SELECT_SCHEMA = Yup.object({
  fileContent: Yup.object().nullable(),
}).required();

export const SelectFile = ({
  setSchema,
}: {
  setSchema: ReactSetState<undefined | OpenAPIV3.Document>;
}) => {
  return (
    <Formik
      initialValues={{ fileContent: "" }}
      onSubmit={async (values) => {
        try {
          setSchema(undefined);
          const object = YAML.parse(values.fileContent) as OpenAPIV3.Document;
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
