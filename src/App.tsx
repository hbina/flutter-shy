import "bootstrap/dist/css/bootstrap.min.css";

import { useState } from "react";

import { OpenApiSchema } from "./types";
import { SelectFile } from "./SelectFile";
import { OpenApiContent } from "./OpenApiContent";

const App = () => {
  const [schema, setSchema] = useState<undefined | OpenApiSchema>(undefined);
  return (
    <div>
      {<SelectFile setSchema={setSchema} />}
      {schema && <OpenApiContent schema={schema} />}
    </div>
  );
};

export default App;
