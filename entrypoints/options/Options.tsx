import Anytype from "./Anytype";
import Arena from "./Arena";
import Instapaper from "./Instapaper";

export default function () {
  return (
    <div className="m-2 prose">
      <h1 className="text-lg">Options</h1>
      <Anytype />
      <Arena />
      <Instapaper />
    </div>
  );
}
