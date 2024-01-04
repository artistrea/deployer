import Prism from "prismjs";
import "prismjs/components/prism-yaml";
import { Pencil } from "lucide-react";
import { CopyToClipboard } from "~/components/CopyToClipboard";
import Editor from "react-simple-code-editor";
import { useState } from "react";

export function FilesPreview() {
  const [code, setCode] = useState("");
  return (
    <div className="relative m-2 flex rounded">
      <span className="absolute right-0 top-0 z-10 flex gap-3 p-3">
        <button className="h-10 w-10 rounded bg-yellow-400/10 p-2 text-yellow-400 hover:bg-yellow-400/20">
          <Pencil />
        </button>
        <CopyToClipboard
          className="rounded bg-white/10 hover:bg-white/20"
          textToCopy={code}
        />
      </span>

      <aside className="bg-zinc-950 p-4">files</aside>
      <Editor
        className="relative font-mono"
        value={code}
        padding={10}
        onValueChange={(code) => setCode(code)}
        highlight={(code) => {
          const gramm = Prism.languages.yml;
          if (gramm) return Prism.highlight(code, gramm, "yml");
        }}
      />
    </div>
  );
}
