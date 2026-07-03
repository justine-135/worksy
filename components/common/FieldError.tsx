// Single-responsibility primitive for rendering a react-hook-form field error.
// Centralises the "danger text under the input" markup so every form renders
// validation messages identically and the styling lives in one place.
export default function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1 text-sm text-danger">{message}</p>;
}
