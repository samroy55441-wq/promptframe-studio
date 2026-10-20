<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Media analysis uses a validated no-signup public endpoint, with OpenAI Responses for images/frames and Gemini Chat Completions for audio, because their supported media input types differ.
- Shared navigation, fonts and notifications are mounted in the root layout so every page has a consistent working shell.
