import { SearchField } from "@heroui/react/search-field";

interface CustomSearchFieldProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function CustomSearchField({
  value,
  onChange,
}: CustomSearchFieldProps) {
  return (
    <SearchField
      name="search"
      aria-label="search user"
      value={value}
      onChange={onChange}
    >
      <SearchField.Group className="rounded-4xl">
        <SearchField.SearchIcon />
        <SearchField.Input className="w-100" placeholder="Search..." />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
