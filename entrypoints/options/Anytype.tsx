import { use, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import { anytypeApiKey, anytypeSpace } from "@/lib/storage";
import Button from "@/components/Button";

const apiKeyPromise = anytypeApiKey.getValue();
const spacesPromise = sendMessage("anytypeSpaces");
const spacePromise = anytypeSpace.getValue();

export default function Anytype() {
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
      await anytypeSpace.setValue(space);
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
            <option value={space.id} key={space.id}>
              {space.name}
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

      <Button type="submit" disabled={submitting} variant="primary">
        {submitting ? "Connecting..." : "Connect to Anytype"}
      </Button>
    </form>
  );
}
