export const resolveStringTemplate = (
  template: string,
  translation: Readonly<Record<string, string>>
) => {
  let resolvedPath = template;
  Object.entries(translation).forEach(([key, value]) => {
    resolvedPath = resolvedPath.replaceAll(`{${key}}`, `${value}`);
  });
  return resolvedPath;
};
