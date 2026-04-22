import { use, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import { anytypeApiKey, anytypeSpace } from "@/lib/storage";

const apiKeyPromise = anytypeApiKey.getValue();
const spacesPromise = sendMessage("anytypeSpaces");
const spacePromise = anytypeSpace.getValue();

export function Anytype() {
  const initialApiKey = use(apiKeyPromise);
  const initialSpaces = use(spacesPromise);
  const initialSpace = use(spacePromise);
  const [authed, setAuthed] = useState(!!initialApiKey);
  const [spaces, setSpaces] = useState(initialSpaces ?? []);
  const [space, setSpace] = useState(initialSpace ?? "");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const challenge: React.SubmitEventHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await sendMessage("anytypeAuthChallenge");
      setChallengeId(response);
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const saveApiKey: React.SubmitEventHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await sendMessage("anytypeAuthKey", {
        challengeId,
        code,
      });

      if (!response) return;

      setAuthed(true);
      setChallengeId("");
      setCode("");

      const spacesResponse = await sendMessage("anytypeSpaces");
      setSpaces(spacesResponse);
      if (spacesResponse.length > 0) {
        setSpace(spacesResponse[0].id);
        await anytypeSpace.setValue(spacesResponse[0].id);
      }
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const saveSpace: React.SubmitEventHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await anytypeApiKey.setValue("");
      setAuthed(false);
      setSpaces([]);
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const disconnect: React.MouseEventHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await anytypeApiKey.setValue("");
      setAuthed(false);
      setSpaces([]);
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return authed ? (
    <form onSubmit={saveSpace} className="max-w-xl">
      <h3>Anytype</h3>
      <label className="flex my-1">
        <span className="w-1/2">Space</span>
        <select
          value={space}
          onChange={(e) => setSpace(e.target.value)}
          className="p-1 min-w-48"
        >
          {spaces.map((space) => (
            <option value={space.id}>{space.name}</option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:bg-gray-500"
      >
        {submitting ? "Saving..." : "Save"}
      </button>
      <button
        type="button"
        onClick={disconnect}
        disabled={submitting}
        className="bg-blue-200 px-4 py-1 rounded hover:bg-blue-300 disabled:bg-gray-500"
      >
        {submitting ? "Disconnecting..." : "Disconnect"}
      </button>
    </form>
  ) : (
    <form onSubmit={challengeId ? saveApiKey : challenge} className="max-w-xl">
      <h3>Anytype</h3>
      {challengeId && (
        <label className="flex my-1">
          <span className="w-1/2">Code</span>
          <input
            type="text"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={submitting}
            className="p-1"
          />
        </label>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:bg-gray-500"
      >
        {submitting ? "Connecting..." : "Connect to Anytype"}
      </button>
    </form>
  );
}
