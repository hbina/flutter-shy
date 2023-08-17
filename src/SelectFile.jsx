import * as Yup from "yup";
import React from "react";

import { load_openapi_definition } from "./backend";

export const FILE_SELECT_SCHEMA = Yup.object({
  fileName: Yup.string().nullable(),
}).required();

export const SelectFile = ({ setFileContent, setFileError }) => {
  const [files, setFiles] = React.useState([]);
  return (
    <div>
      {files.length === 0 ? (
        <div>Please select a swagger file to load</div>
      ) : null}
      {files.length > 1 ? <div>Cannot select more than 1 files</div> : null}
      <form
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <input
          type="file"
          id="swagger-file-path"
          name="swaggerFile"
          onChange={(e) => {
            if (e.target.files !== null) {
              const newFiles = [];
              for (const file of e.target.files) {
                newFiles.push(file);
              }
              setFiles(newFiles);
            } else {
              console.log("no files selected");
            }
          }}
          accept="text/plain"
        />
        <button
          disabled={files.length !== 1}
          onClick={(event) => {
            event.preventDefault();
            if (files.length === 1) {
              const reader = new FileReader();
              reader.addEventListener(
                "load",
                () => {
                  if (typeof reader.result == "string") {
                    try {
                      load_openapi_definition({
                        content: reader.result,
                      })
                        .then((o) => {
                          setFileError(undefined);
                          setFileContent(o);
                        })
                        .catch((e) => {
                          console.log("unable to parse because", e);
                          setFileError(JSON.stringify(e));
                          setFileContent(undefined);
                        });
                    } catch (e) {}
                  } else {
                    console.log(
                      `reader.result is a ${typeof reader.result} and not a string`
                    );
                  }
                },
                false
              );
              reader.readAsText(files[0]);
            }
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};
