export default function parsedDependencies(dependencies: string): string {
  const parsedDependencies = dependencies
    .replace(/[\n]/gi, "")
    .replace(/[[]/gi, "[\n\t")
    .replace(/[,]/gi, ",\n\t")
    .replace(/[\t]/gi, "]");

  return parsedDependencies;
}
