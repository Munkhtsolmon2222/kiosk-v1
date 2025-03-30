import { AiFillSetting } from "react-icons/ai";
import { useState } from "react";

export function Settings() {
  const [setting, setSetting] = useState(false);
  return (
    <div>
      <button onClick={() => setSetting((per) => !per)}>
        <AiFillSetting />
      </button>
      {setting ? <div>hello bitch</div> : ""}
    </div>
  );
}
