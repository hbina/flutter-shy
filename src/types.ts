import React from "react";

export type ReactSetState<T> = React.Dispatch<React.SetStateAction<T>>;
export type ReactState<T> = [T, ReactSetState<T>];

export type OpenApiSchema = {
  paths: Record<
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
  >;
};
