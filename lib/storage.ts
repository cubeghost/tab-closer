export const instapaperUsername = storage.defineItem<string>(
  "local:instapaper-username",
  { fallback: "" },
);
export const instapaperPassword = storage.defineItem<string>(
  "local:instapaper-password",
  { fallback: "" },
);

export const anytypeApiKey = storage.defineItem<string>(
  "local:anytype-apikey",
  {
    fallback: "",
  },
);
export const anytypeSpace = storage.defineItem<string>("local:anytype-space", {
  fallback: "",
});
