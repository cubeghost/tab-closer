export const anytypeApiKey = storage.defineItem<string>(
  "local:anytype-apikey",
  {
    fallback: "",
  },
);
export const anytypeSpace = storage.defineItem<string>("local:anytype-space", {
  fallback: "",
});

export const arenaToken = storage.defineItem<string>("local:arena-token", {
  fallback: "",
});
export const arenaUser = storage.defineItem<string>("local:arena-user", {
  fallback: "",
});
export const arenaDefaultChannel = storage.defineItem<string>(
  "local:arena-default-channel",
  {
    fallback: "",
  },
);

export const instapaperToken = storage.defineItem<string>(
  "local:instapaper-token",
  { fallback: "" },
);
export const instapaperTokenSecret = storage.defineItem<string>(
  "local:instapaper-secret",
  { fallback: "" },
);
export const instapaperDefaultFolder = storage.defineItem<string>(
  "local:instapaper-folder",
  {
    fallback: "",
  },
);
