import "bootstrap/dist/css/bootstrap.min.css";

import { useEffect, useState } from "react";
import { OpenAPIV3 } from "openapi-types";
import axios from "axios";

import { AppPage, ResolvedOpenApiV3, Server } from "./types";
import { SelectFile } from "./SelectFile";
import { ConfigurePaths } from "./ConfigurePaths";
import { ConfigureServers } from "./ConfigureServers";
import { ConfigureAuthentication } from "./ConfigureAuthentication";
import { resolveRefComponents, resolveStringTemplate } from "./util";

const App = () => {
  const [schema, setSchema] = useState<undefined | OpenAPIV3.Document>(
    undefined
  );
  const [resolvedSchema, setResolvedSchema] = useState<
    undefined | ResolvedOpenApiV3.Document
  >(undefined);
  const [baseUrl, setBaseUrl] = useState<undefined | string>(undefined);
  const [currentPage, setCurrentPage] = useState(AppPage.PATHS);
  const [axiosInstance, setAxiosInstance] = useState(() =>
    axios.create({
      baseURL: baseUrl,
    })
  );
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    setResolvedSchema(() =>
      schema ? resolveRefComponents(schema, schema) : undefined
    );
  }, [schema]);

  useEffect(() => {
    setServers(
      (schema?.servers ?? []).map((v) => {
        const variables = v.variables;
        const translation = Object.fromEntries(
          Object.entries(variables ?? {}).map(([k, v]) => [k, v.default])
        );
        const resolvedUrl = resolveStringTemplate(v.url, translation);
        return {
          templateUrl: v.url,
          resolvedUrl,
          variables: v.variables,
          translation,
        };
      })
    );
  }, [schema?.servers]);

  useEffect(() => {
    setAxiosInstance(() =>
      axios.create({
        baseURL: baseUrl,
      })
    );
  }, [baseUrl]);

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
      {resolvedSchema && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              columnGap: "5px",
              justifyContent: "flex-start",
            }}
          >
            <button onClick={() => setCurrentPage(AppPage.PATHS)}>Paths</button>
            <button onClick={() => setCurrentPage(AppPage.SERVERS)}>
              Servers
            </button>
            <button onClick={() => setCurrentPage(AppPage.AUTH)}>
              Authentication
            </button>
          </div>
          <div>
            {currentPage === AppPage.PATHS && (
              <ConfigurePaths
                pathObjects={resolvedSchema.paths}
                axiosInstance={axiosInstance}
              />
            )}
            {currentPage === AppPage.SERVERS && resolvedSchema.servers && (
              <ConfigureServers
                servers={servers}
                setBaseUrl={setBaseUrl}
                setServers={setServers}
              />
            )}
            {currentPage === AppPage.SERVERS && (
              <ConfigureAuthentication setBaseUrl={setBaseUrl} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
