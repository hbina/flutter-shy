export const resolveStringTemplate = (template, translation) => {
  let resolvedPath = template;
  Object.entries(translation).forEach(([key, value]) => {
    resolvedPath = resolvedPath.replaceAll(`{${key}}`, `${value}`);
  });
  return resolvedPath;
};
