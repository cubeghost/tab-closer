import { use, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import { instapaperToken, instapaperTokenSecret } from "@/lib/storage";
import Button from "@/components/Button";

const tokenPromise = instapaperToken.getValue();

export default function Instapaper() {
  const initialToken = use(tokenPromise);
  const [authed, setAuthed] = useState(!!initialToken);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <form onSubmit={authed ? undefined : handleSave} className="max-w-xl">
      <h3>Instapaper</h3>
      {authed ? (
        <Button
          type="button"
          onClick={disconnect}
          disabled={submitting}
          variant="secondary"
        >
          {submitting ? "Disconnecting..." : "Disconnect"}
        </Button>
      ) : (
        <>
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
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:bg-gray-500"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </>
      )}
    </form>
  );
}
