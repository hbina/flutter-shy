import React from "react";

import { ResolvedOpenApiV3 } from "./types";

export type SchemaViewerProps = {
  value: ResolvedOpenApiV3.SchemaObject;
  style: React.CSSProperties;
};

class ArraySchemaViewer extends React.PureComponent<
  SchemaViewerProps,
  Record<string, boolean>
> {
  constructor(props: SchemaViewerProps) {
    super(props);
    this.state = Object.fromEntries(
      Object.entries(props.value).map(([k, v]) => [k, true])
    );
  }

  render() {
    const { value, style } = this.props;

    return (
      <div
        style={{
          ...style,
          flexDirection: "column",
        }}
      >
        <div>Array Schema</div>
        <table>
          <tbody>
            {value.title && (
              <tr>
                <td>Title</td>
                <td>:</td>
                <td>{value.title}</td>
              </tr>
            )}
            {value.default && (
              <tr>
                <td>Default</td>
                <td>:</td>
                <td>{value.default}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

class StringSchemaViewer extends React.PureComponent<
  SchemaViewerProps,
  {
    value: string | undefined;
  }
> {
  constructor(props: SchemaViewerProps) {
    super(props);
    this.state = props.value.default;
  }

  render() {
    const { value, style } = this.props;

    return (
      <div
        style={{
          ...style,
          flexDirection: "column",
        }}
      >
        <div>String Schema</div>
        <table>
          <tbody>
            {value.title && (
              <tr>
                <td>Title</td>
                <td>:</td>
                <td>{value.title}</td>
              </tr>
            )}
            {value.default && (
              <tr>
                <td>Default</td>
                <td>:</td>
                <td>{value.default}</td>
              </tr>
            )}
            {value.enum && (
              <tr>
                <td>Enum</td>
                <td>:</td>
                <td>{`[${value.enum.join(", ")}]`}</td>
              </tr>
            )}
            <tr>
              <td>Value</td>
              <td>:</td>
              <td>
                {value.enum === undefined && (
                  <input
                    type="text"
                    onChange={(v) => {
                      this.setState(() => ({
                        value: v.target.value,
                      }));
                    }}
                  />
                )}
                {value.enum !== undefined && (
                  <select
                    onChange={(v) => {
                      this.setState(() => ({
                        value: v.target.value,
                      }));
                    }}
                  >
                    <option value={undefined}></option>
                    {value.enum.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

class NumberSchemaViewer extends React.PureComponent<
  SchemaViewerProps,
  {
    value: number | undefined;
  }
> {
  constructor(props: SchemaViewerProps) {
    super(props);
    this.state = props.value.default;
  }

  render() {
    const { value, style } = this.props;

    return (
      <div
        style={{
          ...style,
          flexDirection: "column",
        }}
      >
        <div>Number Schema</div>
        <table>
          <tbody>
            {value.title && (
              <tr>
                <td>Title</td>
                <td>:</td>
                <td>{value.title}</td>
              </tr>
            )}
            {value.default && (
              <tr>
                <td>Default</td>
                <td>:</td>
                <td>{value.default}</td>
              </tr>
            )}
            {value.enum && (
              <tr>
                <td>Enum</td>
                <td>:</td>
                <td>{`[${value.enum.join(", ")}]`}</td>
              </tr>
            )}
            <tr>
              <td>Value</td>
              <td>:</td>
              <td>
                {value.enum === undefined && (
                  <input
                    type="number"
                    onChange={(v) => {
                      this.setState(() => ({
                        value: parseFloat(v.target.value),
                      }));
                    }}
                  />
                )}
                {value.enum !== undefined && (
                  <select
                    onChange={(v) => {
                      this.setState(() => ({
                        value: parseFloat(v.target.value),
                      }));
                    }}
                  >
                    <option value={undefined}></option>
                    {value.enum.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

class BooleanSchemaViewer extends React.PureComponent<
  SchemaViewerProps,
  {
    value: boolean | undefined;
  }
> {
  constructor(props: SchemaViewerProps) {
    super(props);
    this.state = { value: false };
  }

  render() {
    const { value, style } = this.props;

    return (
      <div
        style={{
          ...style,
          flexDirection: "column",
        }}
      >
        <div>Boolean Schema</div>
        <table>
          <tbody>
            {value.title && (
              <tr>
                <td>Title</td>
                <td>:</td>
                <td>{value.title}</td>
              </tr>
            )}
            {value.default && (
              <tr>
                <td>Default</td>
                <td>:</td>
                <td>{value.default}</td>
              </tr>
            )}
            <tr>
              <td>Value</td>
              <td>:</td>
              <td>
                <div>{this.state.value}</div>
                <input
                  type="checkbox"
                  onChange={() => {
                    this.setState(({ value }) => ({
                      value: !value,
                    }));
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

class ObjectSchemaViewer extends React.PureComponent<
  {
    value: ResolvedOpenApiV3.SchemaObject;
    style: React.CSSProperties;
  },
  Record<string, boolean>
> {
  constructor(props: SchemaViewerProps) {
    super(props);
    this.state = Object.fromEntries(
      Object.entries(props.value).map(([k, v]) => [k, true])
    );
  }

  render() {
    const { value, style } = this.props;

    return (
      <div
        style={{
          ...style,
          flexDirection: "column",
        }}
      >
        <div>Object Schema</div>
        <table>
          <tbody>
            {Object.entries(value.properties ?? {}).map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td>:</td>
                <td>
                  <SchemaViewer value={v} style={style} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export const SchemaViewer = ({ value, style }: SchemaViewerProps) => {
  if (value.type === "array") {
    return <ArraySchemaViewer value={value} style={style} />;
  } else if (value.type === "boolean") {
    return <BooleanSchemaViewer value={value} style={style} />;
  } else if (value.type === "object") {
    return <ObjectSchemaViewer value={value} style={style} />;
  } else if (value.type === "number") {
    return <div style={style}>Number Schema</div>;
  } else if (value.type === "string") {
    return <StringSchemaViewer value={value} style={style} />;
  } else if (value.type === "integer") {
    return <NumberSchemaViewer value={value} style={style} />;
  } else {
    return <>Not implemented</>;
  }
};
