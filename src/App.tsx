import "bootstrap/dist/css/bootstrap.min.css";

import { useState } from "react";

import { AppPage, OpenApiSchema } from "./types";
import { SelectFile } from "./SelectFile";
import { ConfigurePaths } from "./ConfigurePaths";
import { ConfigureServers } from "./ConfigureServers";

const App = () => {
  const [schema, setSchema] = useState<undefined | OpenApiSchema>(undefined);
  const [currentPage, setCurrentPage] = useState(AppPage.OPEN_API_PATHS);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "5px",
        rowGap: "5px",
      }}
    >
      <SelectFile setSchema={setSchema} />
      {schema && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              columnGap: "5px",
              justifyContent: "flex-start",
            }}
          >
            <button onClick={() => setCurrentPage(AppPage.OPEN_API_PATHS)}>
              Paths
            </button>
            <button onClick={() => setCurrentPage(AppPage.OPEN_API_SERVERS)}>
              Servers
            </button>
          </div>
          <div>
            {currentPage === AppPage.OPEN_API_PATHS && (
              <ConfigurePaths openApiPaths={schema.paths} />
            )}
            {currentPage === AppPage.OPEN_API_SERVERS && (
              <ConfigureServers pServers={schema.servers} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
