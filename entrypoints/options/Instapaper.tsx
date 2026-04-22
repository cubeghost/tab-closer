import { use, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import { instapaperPassword, instapaperUsername } from "@/lib/storage";

const usernamePromise = instapaperUsername.getValue();
const passwordPromise = instapaperPassword.getValue();

export function Instapaper() {
  const initialUsername = use(usernamePromise);
  const initialPassword = use(passwordPromise);
  const [username, setUsername] = useState(initialUsername ?? "");
  const [password, setPassword] = useState(initialPassword ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSave: React.SubmitEventHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await sendMessage("instapaperAuth", {
        username,
        password,
      });
      console.log("auth response", response);
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:bg-gray-500"
      >
        {submitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
