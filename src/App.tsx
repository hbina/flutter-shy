import "bootstrap/dist/css/bootstrap.min.css";

import { Form, Formik } from "formik";
import * as Yup from "yup";
import { load_openapi_definition } from "./util";

const fileSelectSchema = Yup.object({
  fileContent: Yup.object().nullable(),
}).required();

const App = () => {
  return (
    <div>
      <Formik
        initialValues={{ fileContent: "" }}
        onSubmit={async (values, actions) => {
          console.log("values", values);
          console.log("actions", actions);
          try {
            await load_openapi_definition({ content: values.fileContent });
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
    </div>
  );
};

export default App;
