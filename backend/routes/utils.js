export function createErrorResponseObject(errorString) {
  // TODO: Make this more robust
  return ({
    error: true,
    message: `ERROR: ${errorString}`,
    timestamp: Date.now(),
  });
}
