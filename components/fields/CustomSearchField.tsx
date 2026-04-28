import { SearchField } from "@heroui/react/search-field";

export default function CustomSearchField() {
  return (
    <SearchField name="search" aria-label="search user" className="p-2">
      <SearchField.Group className="h-12 rounded-4xl">
        <SearchField.SearchIcon />
        <SearchField.Input className="w-100" placeholder="Search..." />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
