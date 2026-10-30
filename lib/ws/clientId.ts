const clientId =
  typeof window !== "undefined" ? crypto.randomUUID() : "";

export default clientId;
