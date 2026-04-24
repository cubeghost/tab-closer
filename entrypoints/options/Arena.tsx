import { use, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import { arenaDefaultChannel, arenaToken, arenaUser } from "@/lib/storage";
import Button from "@/components/Button";

const tokenPromise = arenaToken.getValue();
const channelsPromise = sendMessage("arenaChannels");
const defaultChannelPromise = arenaDefaultChannel.getValue();

export default function Arena() {
  const initialToken = use(tokenPromise);
  const [token, setToken] = useState(initialToken ?? "");
  const [authed, setAuthed] = useState(!!initialToken);
  const [channels, setChannels] = useState(use(channelsPromise) ?? []);
  const [defaultChannel, setDefaultChannel] = useState(
    use(defaultChannelPromise) ?? [],
  );
  const [submitting, setSubmitting] = useState(false);

  const saveToken: React.SubmitEventHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const user = await sendMessage("arenaCurrentUser", {
        token,
      });

      if (user) {
        setAuthed(true);
        const channels = await sendMessage("arenaChannels");
        setChannels(channels);
        if (channels.length > 0) {
          setDefaultChannel(channels[0].id);
          await arenaDefaultChannel.setValue(channels[0].id);
        }
      }
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const saveDefaultChannel: React.SubmitEventHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await arenaDefaultChannel.setValue(defaultChannel);
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const disconnect = async () => {
    await arenaToken.setValue("");
    await arenaUser.setValue("");
    await arenaDefaultChannel.setValue("");
    setAuthed(false);
    setToken("");
    setChannels([]);
  };

  return authed ? (
    <form onSubmit={saveDefaultChannel} className="max-w-xl">
      <h3>Are.na</h3>
      <label className="flex my-1">
        <span className="w-1/2">Default channel</span>
        <select
          value={defaultChannel}
          onChange={(e) => setDefaultChannel(e.target.value)}
          className="p-1 min-w-48"
        >
          {channels.map((channel) => (
            <option value={channel.id} key={channel.id}>
              {channel.title}
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
    <form onSubmit={saveToken} className="max-w-xl">
      <h3>Are.na</h3>
      <label className="flex my-1">
        <span className="w-1/2">Personal access token</span>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={submitting}
          className="p-1"
        />
      </label>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
