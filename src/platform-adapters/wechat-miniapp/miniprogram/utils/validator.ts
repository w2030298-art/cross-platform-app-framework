export const validator = {
  required(value: string): boolean {
    return value.trim().length > 0
  },
  feedbackLength(value: string, max = 500): boolean {
    const len = value.trim().length
    return len > 0 && len <= max
  }
}
