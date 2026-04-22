import { Instapaper } from "./Instapaper";
import { Anytype } from "./Anytype";

export default function () {
  return (
    <div className="m-2 prose">
      <h1 className="text-lg">Options</h1>
      <Instapaper />
      <Anytype />
    </div>
  );
}
