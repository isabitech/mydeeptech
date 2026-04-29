// Pagination handler for projects
export const createHandlePageChange = (
  setCurrentPage: (page: number) => void,
  setPageSize: (size: number) => void,
  fetchProjects: (page: number) => void,
  pageSize: number
) => {
  return (page: number, size?: number) => {
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    setCurrentPage(page);
    fetchProjects(page);
  };
};