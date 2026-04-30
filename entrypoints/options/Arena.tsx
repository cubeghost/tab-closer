import { use, useState } from "react";
import pkceChallenge, { verifyChallenge } from "pkce-challenge";
import { sendMessage } from "@/lib/messaging";
import { arenaDefaultChannel, arenaToken, arenaUser } from "@/lib/storage";
import Button from "@/components/Button";

const tokenPromise = arenaToken.getValue();
const channelsPromise = sendMessage("arenaChannels");
const defaultChannelPromise = arenaDefaultChannel.getValue();

export default function Arena() {
  const initialToken = use(tokenPromise);
  const [authed, setAuthed] = useState(!!initialToken);
  const [channels, setChannels] = useState(use(channelsPromise) ?? []);
  const [defaultChannel, setDefaultChannel] = useState(
    use(defaultChannelPromise) ?? "",
  );
  const [submitting, setSubmitting] = useState(false);

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
    setChannels([]);
  };

  const startAuthFlow: React.SubmitEventHandler = async (event) => {
    event.preventDefault();

    try {
      const redirectUri = browser.identity.getRedirectURL("arena");
      const pkce = await pkceChallenge();

      const url = new URL("https://www.are.na/oauth/authorize");
      url.searchParams.set("client_id", import.meta.env.WXT_ARENA_CLIENT_ID);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "write");
      url.searchParams.set("code_challenge", pkce.code_challenge);
      url.searchParams.set("code_challenge_method", pkce.code_challenge_method);

      const endRedirect = await browser.identity.launchWebAuthFlow({
        url: url.toString(),
        interactive: true,
      });

      if (endRedirect) {
        const endUrl = new URL(endRedirect);
        const code = endUrl.searchParams.get("code");
        if (!code) return;

        const user = await sendMessage("arenaAuth", {
          code,
          codeVerifier: pkce.code_verifier,
          redirectUri,
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
      }
    } catch (error) {
    } finally {
      setSubmitting(false);
    }
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
    <form onSubmit={startAuthFlow} className="max-w-xl">
      <h3>Are.na</h3>
      <Button type="submit" variant="primary">
        Log in with Are.na
      </Button>
    </form>
  );
}
