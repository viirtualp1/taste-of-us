export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  const apiError = error as {
    data?: { message?: string }
    message?: string
  }

  return apiError?.data?.message || apiError?.message || fallback
}
