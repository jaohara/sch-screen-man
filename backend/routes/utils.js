export function createErrorResponseObject(errorString, errorType = null) {
  const errorResponseObject = {
      error: true,
      message: `ERROR: ${errorString}`,
      timestamp: Date.now(),
  };

  if (errorType) {
    errorResponseObject.errorType = errorType;
  }

  return (errorResponseObject);
}

export function parseAndCheckScreenIdFromRequest(req, res) {
  const { screenId } = req.params;
  const id = parseInt(screenId);

  if (isNaN(id)) {
    const errorString = "Provided ID is not a number.";
    const errorType = "INVALID_ID";
    const errorObject = createErrorResponseObject(errorString, errorType);
    res.json(errorObject);
    return null;
  }

  return id;
}

export const isValidPiConfigId = (piConfig, id) => 
  id !== null && !isNaN(id) && id >= 0 && id < piConfig.length;
