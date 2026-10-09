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

- Keep service-management UI modules in src/components/service and content pages in TanStack routes; this separates the shared workspace from page logic.
- Store client, order, bank and finance records in Lovable Cloud with owner-scoped RLS; every account must only access its own records.
- Browser Data API calls use the generated RLS client; external payment calls must use authenticated server functions.
