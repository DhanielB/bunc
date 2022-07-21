export default function parsedDependencies(dependencies: string): string {
  const parsedDependencies = dependencies
    .replaceAll('{', '{\n\t')
    .replaceAll(',', ',\n\t')
    .replaceAll('}', '\n}')

  return parsedDependencies;
}
