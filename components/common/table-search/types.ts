export type FilterKind = "text" | "static" | "async";

export interface FilterOption {
  value: string;
  label: string;
  dot?: string;
  avatar?: { src?: string; name: string };
}

export interface AsyncFilterData {
  items: FilterOption[];
  isLoading: boolean;
  search: string;
  onSearch: (s: string) => void;
}

export interface FilterDef {
  type: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  kind: FilterKind;
  options?: FilterOption[];
}

export interface ActiveFilter {
  type: string;
  value: string | null;
  displayLabel: string | null;
}
