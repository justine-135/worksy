import { useState } from "react";

export default function usePagination() {
  const [page, setPage] = useState<number>(0);
  return { page, setPage };
}
