export function reportLovableError(error: unknown) {
  console.error("Lovable reported error:", error);
}

export function reportError(error: unknown) {
  console.error("Reported error:", error);
}

export default reportLovableError;
