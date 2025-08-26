Awesome—here’s a crisp, implementation-reaAwesome—here’s a crisp, implementation-ready requirements spec for a \*\*Tokenizer Comparator\*\* app that runs on \*\*Vercel\*\* and uses \*\*shadcn/ui\*\*.



\# 1) Goal



Let users compare how different tokenizers split the \*\*same input text\*\*. The page shows \*\*three independent tokenizer panels\*\*, each with:



\* A tokenizer picker (dropdown)

\* Total token count

\* A \*\*colored text\*\* visualization (token-by-token)

\* A \*\*token list\*\* (order, piece, id, start/end offsets, byte length)



\# 2) Scope



\* Single-page web app (Next.js + App Router) deployed to Vercel

\* Purely client-side tokenization (no server calls for tokenization)

\* Styling/components via \*\*shadcn/ui\*\* + Tailwind



Out of scope (for v1): authentication, saving to cloud, multi-page routing.



\# 3) Tokenizers (v1)



Initial set (covering common families and useful contrasts):



1\. \*\*GPT-2 / r50k\\\_base\*\* (BPE)

2\. \*\*GPT-3/4 / cl100k\\\_base\*\* (BPE)

3\. \*\*Llama-3\*\* tokenizer (SentencePiece)



> Notes

>

> \* Use `@dqbd/tiktoken` (WASM) for r50k\\\_base and cl100k\\\_base.

> \* Use a JS/WASM SentencePiece implementation (e.g., HF tokenizers wasm or sentencepiece.js) for Llama-3.

> \* Lazy-load tokenizer engines per panel to keep initial bundle small.



\# 4) Core UX



\## Layout



\* \*\*Header\*\*: app name + short description + GitHub link (optional).

\* \*\*Input area\*\* (top):



&nbsp; \* `Textarea` with a preloaded example (the chat-format string from your screenshot is perfect).

&nbsp; \* Controls row:



&nbsp;   \* “Tokenize” (optional; default is \*\*debounced auto\*\* tokenization on input)

&nbsp;   \* “Show whitespace” toggle

&nbsp;   \* “Sync panels” toggle (if ON, changing one panel’s tokenizer applies to all three)

&nbsp;   \* “Share” button (copies URL with query params)

\* \*\*Three equal columns\*\* (responsive: stack on mobile). Each column contains:



&nbsp; \* \*\*Card\*\*



&nbsp;   \* `Select` (tokenizer)

&nbsp;   \* `Badge` showing \*\*Total tokens\*\*

&nbsp;   \* `Tabs`: \*\*Colored text\*\* | \*\*Token list\*\*



&nbsp;     \* \*\*Colored text\*\*: each token rendered with a deterministic color (HSL by token index), tooltip on hover showing `(index, id, piece, \[start,end])`.

&nbsp;     \* \*\*Token list\*\* (`Table` in a `ScrollArea`):



&nbsp;       \* Columns: `#`, `piece`, `id`, `start`, `end`, `bytes`

&nbsp;       \* Copy buttons: “Copy ids”, “Copy pieces”, “Copy as JSON/CSV”

&nbsp;   \* Footer row (small): processing time (ms), model note.



\## Interactions



\* Debounced tokenization (\\~150–250ms after last keypress).

\* Hover a token (in text or list) → highlight the corresponding token in both views within the panel.

\* Optional: \*\*“Link highlights across panels”\*\* toggle (experimental): hovering token \*i\* in one panel highlights token \*i\* in the other two (useful for quick visual diffs).



\## Accessibility



\* All interactive controls keyboard-navigable, ARIA labels for dropdowns/toggles.

\* WCAG AA color contrast; add \*\*“High contrast”\*\* toggle if needed.

\* Don’t encode information with color alone: also outline/underline hovered token.



\# 5) Functional Requirements



1\. \*\*Input handling\*\*



&nbsp;  \* Textarea accepts arbitrary Unicode text (including emojis, right-to-left scripts).

&nbsp;  \* Large text support up to at least \\~200k chars (with guardrails/warnings).



2\. \*\*Tokenization\*\*



&nbsp;  \* For each panel, tokenize the current input using the selected tokenizer.

&nbsp;  \* Return structured tokens:



&nbsp;    ```

&nbsp;    {

&nbsp;      index: number,

&nbsp;      id: number,              // tokenizer-specific

&nbsp;      piece: string,           // decoded string for token

&nbsp;      start: number,           // char offset in input

&nbsp;      end: number,             // char offset in input (exclusive)

&nbsp;      bytes: number            // UTF-8 byte length of piece

&nbsp;    }

&nbsp;    ```

&nbsp;  \* Compute \*\*total tokens\*\* and \*\*latency (ms)\*\*.



3\. \*\*Colored text view\*\*



&nbsp;  \* Render tokens sequentially; preserve exact text (including whitespace if toggle enabled).

&nbsp;  \* Deterministic color per token index: e.g., `h = (index \* 47) % 360; s=60%; l=60%`.

&nbsp;  \* Tooltip/`HoverCard`: show `#`, `id`, `bytes`, `piece` (escaped), `range`.



4\. \*\*Token list view\*\*



&nbsp;  \* Paginated or virtualized if token count > 2,000 (keep UI snappy).

&nbsp;  \* Copy buttons:



&nbsp;    \* \*\*Ids\*\*: space-separated (or comma—configurable)

&nbsp;    \* \*\*Pieces\*\*: JSON array of strings (escaped)

&nbsp;    \* \*\*JSON\*\*: full token objects

&nbsp;    \* \*\*CSV\*\*: `index,piece,id,start,end,bytes`



5\. \*\*Persistence \& Sharing\*\*



&nbsp;  \* Persist input text and selected tokenizers in `localStorage`.

&nbsp;  \* “Share” builds a URL with query params: `?t=<input>\&p1=<tok>\&p2=<tok>\&p3=<tok>\&ws=0/1`.

&nbsp;  \* On load, hydrate state from query params → then from localStorage.



6\. \*\*Performance\*\*



&nbsp;  \* Lazy-load tokenizer engines per panel.

&nbsp;  \* Use \*\*Web Workers\*\* for tokenization to keep UI responsive.

&nbsp;  \* Aim for < 150ms perceived latency for 5k-token inputs on modern laptops.



7\. \*\*Privacy/Security\*\*



&nbsp;  \* No network calls with user text. Everything runs client-side.

&nbsp;  \* Strict CSP; no third-party analytics by default.



\# 6) UI Components (shadcn/ui)



\* \*\*Textarea\*\* for input

\* \*\*Select\*\* for tokenizer picker

\* \*\*Badge\*\* for token count

\* \*\*Tabs\*\* for switching views

\* \*\*Card / CardHeader / CardContent / CardFooter\*\*

\* \*\*Button\*\*, \*\*Toggle\*\*, \*\*Switch\*\*, \*\*Tooltip/HoverCard\*\*, \*\*ScrollArea\*\*, \*\*Separator\*\*

\* \*\*Table\*\* with sticky header in `ScrollArea`

\* Optional: \*\*Sheet\*\* or \*\*Dialog\*\* for settings/help



\# 7) State \& Architecture



\* \*\*Framework\*\*: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui

\* \*\*State\*\*:



&nbsp; \* Global: input text, “show whitespace”, “sync panels”

&nbsp; \* Per-panel: selected tokenizer, tokens\\\[], stats

\* \*\*Workers\*\*: one shared Worker per tokenizer family (or 3 workers), messaging via `postMessage`.

\* \*\*Tokenization adapters\*\* (uniform interface):



&nbsp; \* `tiktokenAdapter(name: 'r50k' | 'cl100k')`

&nbsp; \* `sentencePieceAdapter(name: 'llama3')`

\* \*\*Color utility\*\*: `tokenIndexToHsl(i: number) => string`



\# 8) File/Folder Structure (suggested)



```

/app

&nbsp; /page.tsx

&nbsp; /components

&nbsp;   InputArea.tsx

&nbsp;   Panel.tsx

&nbsp;   TokenText.tsx

&nbsp;   TokenTable.tsx

&nbsp;   Controls.tsx

&nbsp; /lib

&nbsp;   tokenize/

&nbsp;     index.ts

&nbsp;     tiktoken.ts

&nbsp;     sentencepiece.ts

&nbsp;   color.ts

&nbsp;   format.ts  // copy helpers (csv/json/ids/pieces)

&nbsp; /workers

&nbsp;   tiktoken.worker.ts

&nbsp;   sentencepiece.worker.ts

/styles

&nbsp; globals.css

&nbsp; tailwind.css

```



\# 9) Acceptance Criteria



\* Typing into the textarea triggers debounced re-tokenization in \*\*all three panels\*\*.

\* Changing a panel’s tokenizer updates only that panel \*\*unless “Sync panels” is ON\*\*.

\* Each panel shows a \*\*token count\*\* that matches its list length.

\* Colored text view exactly reconstructs input (visually identical when “show whitespace” is off; with visible markers when on).

\* Copy buttons produce correctly formatted content.

\* Share URL reproduces the same state on open.

\* No network requests leave the app with user text (verify via DevTools).



\# 10) Example Defaults



\* \*\*Default input\*\*: the chat-format snippet from your screenshot.

\* \*\*Default tokenizers\*\*:



&nbsp; \* Panel 1: \*\*cl100k\\\_base\*\*

&nbsp; \* Panel 2: \*\*r50k\\\_base\*\*

&nbsp; \* Panel 3: \*\*Llama-3 (SentencePiece)\*\*



\# 11) Testing



\* \*\*Unit\*\*: token adapters return consistent ids \& pieces for a set of known strings (snapshots).

\* \*\*E2E (Playwright)\*\*:



&nbsp; \* Debounce works (no more than N calls while typing).

&nbsp; \* Switching tokenizer changes counts.

&nbsp; \* Share link round-trips state.

&nbsp; \* Large input doesn’t freeze UI (worker in use).



\# 12) Performance Budget



\* Initial UI bundle ≤ \*\*250 KB\*\* gz (before tokenizers).

\* Each tokenizer engine lazy-loaded ≤ \*\*1–2 MB\*\* gz (WASM) and cached.

\* First interactive ≤ \*\*1.0s\*\* on Vercel/Edge + modern laptop.



\# 13) Future Enhancements (nice-to-have)



\* Add \*\*o200k\\\_base\*\*, \*\*BPE merges viewer\*\*, \*\*byte-level view\*\*.

\* Side-by-side diff mode (show where splits differ).

\* \*\*Cost estimator\*\* (tokens × price per 1K).

\* Drag-drop file input; export full report as JSON.



---



If you’d like, I can scaffold the Next.js + shadcn project structure and stub the tokenizer adapters so you can deploy to Vercel immediately.

dy requirements spec for a \*\*Tokenizer Comparator\*\* app that runs on \*\*Vercel\*\* and uses \*\*shadcn/ui\*\*.



\# 1) Goal



Let users compare how different tokenizers split the \*\*same input text\*\*. The page shows \*\*three independent tokenizer panels\*\*, each with:



\* A tokenizer picker (dropdown)

\* Total token count

\* A \*\*colored text\*\* visualization (token-by-token)

\* A \*\*token list\*\* (order, piece, id, start/end offsets, byte length)



\# 2) Scope



\* Single-page web app (Next.js + App Router) deployed to Vercel

\* Purely client-side tokenization (no server calls for tokenization)

\* Styling/components via \*\*shadcn/ui\*\* + Tailwind



Out of scope (for v1): authentication, saving to cloud, multi-page routing.



\# 3) Tokenizers (v1)



Initial set (covering common families and useful contrasts):



1\. \*\*GPT-2 / r50k\\\_base\*\* (BPE)

2\. \*\*GPT-3/4 / cl100k\\\_base\*\* (BPE)

3\. \*\*Llama-3\*\* tokenizer (SentencePiece)



> Notes

>

> \* Use `@dqbd/tiktoken` (WASM) for r50k\\\_base and cl100k\\\_base.

> \* Use a JS/WASM SentencePiece implementation (e.g., HF tokenizers wasm or sentencepiece.js) for Llama-3.

> \* Lazy-load tokenizer engines per panel to keep initial bundle small.



\# 4) Core UX



\## Layout



\* \*\*Header\*\*: app name + short description + GitHub link (optional).

\* \*\*Input area\*\* (top):



&nbsp; \* `Textarea` with a preloaded example (the chat-format string from your screenshot is perfect).

&nbsp; \* Controls row:



&nbsp;   \* “Tokenize” (optional; default is \*\*debounced auto\*\* tokenization on input)

&nbsp;   \* “Show whitespace” toggle

&nbsp;   \* “Sync panels” toggle (if ON, changing one panel’s tokenizer applies to all three)

&nbsp;   \* “Share” button (copies URL with query params)

\* \*\*Three equal columns\*\* (responsive: stack on mobile). Each column contains:



&nbsp; \* \*\*Card\*\*



&nbsp;   \* `Select` (tokenizer)

&nbsp;   \* `Badge` showing \*\*Total tokens\*\*

&nbsp;   \* `Tabs`: \*\*Colored text\*\* | \*\*Token list\*\*



&nbsp;     \* \*\*Colored text\*\*: each token rendered with a deterministic color (HSL by token index), tooltip on hover showing `(index, id, piece, \[start,end])`.

&nbsp;     \* \*\*Token list\*\* (`Table` in a `ScrollArea`):



&nbsp;       \* Columns: `#`, `piece`, `id`, `start`, `end`, `bytes`

&nbsp;       \* Copy buttons: “Copy ids”, “Copy pieces”, “Copy as JSON/CSV”

&nbsp;   \* Footer row (small): processing time (ms), model note.



\## Interactions



\* Debounced tokenization (\\~150–250ms after last keypress).

\* Hover a token (in text or list) → highlight the corresponding token in both views within the panel.

\* Optional: \*\*“Link highlights across panels”\*\* toggle (experimental): hovering token \*i\* in one panel highlights token \*i\* in the other two (useful for quick visual diffs).



\## Accessibility



\* All interactive controls keyboard-navigable, ARIA labels for dropdowns/toggles.

\* WCAG AA color contrast; add \*\*“High contrast”\*\* toggle if needed.

\* Don’t encode information with color alone: also outline/underline hovered token.



\# 5) Functional Requirements



1\. \*\*Input handling\*\*



&nbsp;  \* Textarea accepts arbitrary Unicode text (including emojis, right-to-left scripts).

&nbsp;  \* Large text support up to at least \\~200k chars (with guardrails/warnings).



2\. \*\*Tokenization\*\*



&nbsp;  \* For each panel, tokenize the current input using the selected tokenizer.

&nbsp;  \* Return structured tokens:



&nbsp;    ```

&nbsp;    {

&nbsp;      index: number,

&nbsp;      id: number,              // tokenizer-specific

&nbsp;      piece: string,           // decoded string for token

&nbsp;      start: number,           // char offset in input

&nbsp;      end: number,             // char offset in input (exclusive)

&nbsp;      bytes: number            // UTF-8 byte length of piece

&nbsp;    }

&nbsp;    ```

&nbsp;  \* Compute \*\*total tokens\*\* and \*\*latency (ms)\*\*.



3\. \*\*Colored text view\*\*



&nbsp;  \* Render tokens sequentially; preserve exact text (including whitespace if toggle enabled).

&nbsp;  \* Deterministic color per token index: e.g., `h = (index \* 47) % 360; s=60%; l=60%`.

&nbsp;  \* Tooltip/`HoverCard`: show `#`, `id`, `bytes`, `piece` (escaped), `range`.



4\. \*\*Token list view\*\*



&nbsp;  \* Paginated or virtualized if token count > 2,000 (keep UI snappy).

&nbsp;  \* Copy buttons:



&nbsp;    \* \*\*Ids\*\*: space-separated (or comma—configurable)

&nbsp;    \* \*\*Pieces\*\*: JSON array of strings (escaped)

&nbsp;    \* \*\*JSON\*\*: full token objects

&nbsp;    \* \*\*CSV\*\*: `index,piece,id,start,end,bytes`



5\. \*\*Persistence \& Sharing\*\*



&nbsp;  \* Persist input text and selected tokenizers in `localStorage`.

&nbsp;  \* “Share” builds a URL with query params: `?t=<input>\&p1=<tok>\&p2=<tok>\&p3=<tok>\&ws=0/1`.

&nbsp;  \* On load, hydrate state from query params → then from localStorage.



6\. \*\*Performance\*\*



&nbsp;  \* Lazy-load tokenizer engines per panel.

&nbsp;  \* Use \*\*Web Workers\*\* for tokenization to keep UI responsive.

&nbsp;  \* Aim for < 150ms perceived latency for 5k-token inputs on modern laptops.



7\. \*\*Privacy/Security\*\*



&nbsp;  \* No network calls with user text. Everything runs client-side.

&nbsp;  \* Strict CSP; no third-party analytics by default.



\# 6) UI Components (shadcn/ui)



\* \*\*Textarea\*\* for input

\* \*\*Select\*\* for tokenizer picker

\* \*\*Badge\*\* for token count

\* \*\*Tabs\*\* for switching views

\* \*\*Card / CardHeader / CardContent / CardFooter\*\*

\* \*\*Button\*\*, \*\*Toggle\*\*, \*\*Switch\*\*, \*\*Tooltip/HoverCard\*\*, \*\*ScrollArea\*\*, \*\*Separator\*\*

\* \*\*Table\*\* with sticky header in `ScrollArea`

\* Optional: \*\*Sheet\*\* or \*\*Dialog\*\* for settings/help



\# 7) State \& Architecture



\* \*\*Framework\*\*: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui

\* \*\*State\*\*:



&nbsp; \* Global: input text, “show whitespace”, “sync panels”

&nbsp; \* Per-panel: selected tokenizer, tokens\\\[], stats

\* \*\*Workers\*\*: one shared Worker per tokenizer family (or 3 workers), messaging via `postMessage`.

\* \*\*Tokenization adapters\*\* (uniform interface):



&nbsp; \* `tiktokenAdapter(name: 'r50k' | 'cl100k')`

&nbsp; \* `sentencePieceAdapter(name: 'llama3')`

\* \*\*Color utility\*\*: `tokenIndexToHsl(i: number) => string`



\# 8) File/Folder Structure (suggested)



```

/app

&nbsp; /page.tsx

&nbsp; /components

&nbsp;   InputArea.tsx

&nbsp;   Panel.tsx

&nbsp;   TokenText.tsx

&nbsp;   TokenTable.tsx

&nbsp;   Controls.tsx

&nbsp; /lib

&nbsp;   tokenize/

&nbsp;     index.ts

&nbsp;     tiktoken.ts

&nbsp;     sentencepiece.ts

&nbsp;   color.ts

&nbsp;   format.ts  // copy helpers (csv/json/ids/pieces)

&nbsp; /workers

&nbsp;   tiktoken.worker.ts

&nbsp;   sentencepiece.worker.ts

/styles

&nbsp; globals.css

&nbsp; tailwind.css

```



\# 9) Acceptance Criteria



\* Typing into the textarea triggers debounced re-tokenization in \*\*all three panels\*\*.

\* Changing a panel’s tokenizer updates only that panel \*\*unless “Sync panels” is ON\*\*.

\* Each panel shows a \*\*token count\*\* that matches its list length.

\* Colored text view exactly reconstructs input (visually identical when “show whitespace” is off; with visible markers when on).

\* Copy buttons produce correctly formatted content.

\* Share URL reproduces the same state on open.

\* No network requests leave the app with user text (verify via DevTools).



\# 10) Example Defaults



\* \*\*Default input\*\*: the chat-format snippet from your screenshot.

\* \*\*Default tokenizers\*\*:



&nbsp; \* Panel 1: \*\*cl100k\\\_base\*\*

&nbsp; \* Panel 2: \*\*r50k\\\_base\*\*

&nbsp; \* Panel 3: \*\*Llama-3 (SentencePiece)\*\*



\# 11) Testing



\* \*\*Unit\*\*: token adapters return consistent ids \& pieces for a set of known strings (snapshots).

\* \*\*E2E (Playwright)\*\*:



&nbsp; \* Debounce works (no more than N calls while typing).

&nbsp; \* Switching tokenizer changes counts.

&nbsp; \* Share link round-trips state.

&nbsp; \* Large input doesn’t freeze UI (worker in use).



\# 12) Performance Budget



\* Initial UI bundle ≤ \*\*250 KB\*\* gz (before tokenizers).

\* Each tokenizer engine lazy-loaded ≤ \*\*1–2 MB\*\* gz (WASM) and cached.

\* First interactive ≤ \*\*1.0s\*\* on Vercel/Edge + modern laptop.



\# 13) Future Enhancements (nice-to-have)



\* Add \*\*o200k\\\_base\*\*, \*\*BPE merges viewer\*\*, \*\*byte-level view\*\*.

\* Side-by-side diff mode (show where splits differ).

\* \*\*Cost estimator\*\* (tokens × price per 1K).

\* Drag-drop file input; export full report as JSON.



---



If you’d like, I can scaffold the Next.js + shadcn project structure and stub the tokenizer adapters so you can deploy to Vercel immediately.



