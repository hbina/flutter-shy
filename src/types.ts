import React from "react";

export type ReactSetState<T> = React.Dispatch<React.SetStateAction<T>>;
export type ReactState<T> = [T, ReactSetState<T>];

export type OpenApiServers = ReadonlyArray<{
  url: string;
  variables?: Record<
    string,
    {
      default: string;
      description: string;
      enum: Array<string>;
    }
  >;
}>;

export type OpenApiPath = Readonly<
  Record<
    string,
    {
      get?: {
        operationId: string;
        parameters: {
          description: string;
          in: string;
          name: string;
          schema: {
            format: string;
            type: string;
          };
          required: boolean;
        }[];
      };
    }
  >
>;

export type OpenApiSchema = Readonly<{
  info: {
    title: string;
  };
  paths: OpenApiPath;
  servers?: OpenApiServers;
}>;

export enum AppPage {
  OPEN_API_PATHS,
  OPEN_API_SERVERS,
}
