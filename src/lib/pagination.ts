
export const getPaginatedRequestParams = (page: number, pageSize: number = 10) => {
  return {
    page,
    totalInList: pageSize,
  }
}