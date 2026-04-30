import { use, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import {
  instapaperToken,
  instapaperTokenSecret,
  instapaperDefaultFolder,
} from "@/lib/storage";
import Button from "@/components/Button";

const tokenPromise = instapaperToken.getValue();
const foldersPromise = sendMessage("instapaperFolders");
const defaultFolderPromise = instapaperDefaultFolder.getValue();

export default function Instapaper() {
  const initialToken = use(tokenPromise);
  const [authed, setAuthed] = useState(!!initialToken);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [folders, setFolders] = useState(use(foldersPromise) ?? []);
  const [defaultFolder, setDefaultFolder] = useState(
    use(defaultFolderPromise) ?? "",
  );
  const [submitting, setSubmitting] = useState(false);

  const saveDefaultFolder: React.SubmitEventHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await instapaperDefaultFolder.setValue(defaultFolder);
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave: React.SubmitEventHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await sendMessage("instapaperAuth", {
        username,
        password,
      });

      if (response) {
        setAuthed(true);
        setUsername("");
        setPassword("");

        const foldersResponse = await sendMessage("instapaperFolders");
        setFolders(foldersResponse);
      }
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const disconnect: React.MouseEventHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await instapaperToken.setValue("");
      await instapaperTokenSecret.setValue("");
      setAuthed(false);
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return authed ? (
    <form onSubmit={saveDefaultFolder} className="max-w-xl">
      <h3>Instapaper</h3>
      <label className="flex my-1">
        <span className="w-1/2">Default folder</span>
        <select
          value={defaultFolder}
          onChange={(e) => setDefaultFolder(e.target.value)}
          className="p-1 min-w-48"
        >
          <option value=""></option>
          {folders.map((folder) => (
            <option value={folder.folder_id} key={folder.folder_id}>
              {folder.display_title}
            </option>
          ))}
        </select>
      </label>
      <Button
        type="submit"
        disabled={submitting}
        variant="primary"
        className="mr-2"
      >
        {submitting ? "Saving..." : "Save"}
      </Button>
      <Button
        type="button"
        onClick={disconnect}
        disabled={submitting}
        variant="secondary"
      >
        {submitting ? "Disconnecting..." : "Disconnect"}
      </Button>
    </form>
  ) : (
    <form onSubmit={handleSave} className="max-w-xl">
      <h3>Instapaper</h3>
      <label className="flex my-1">
        <span className="w-1/2">Username or email</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={submitting}
          className="p-1"
        />
      </label>
      <label className="flex my-1">
        <span className="w-1/2">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          className="p-1"
        />
      </label>
      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
