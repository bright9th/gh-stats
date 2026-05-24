export function snapshotName() {
  return new Date().toISOString().replaceAll(":", "-");
}
