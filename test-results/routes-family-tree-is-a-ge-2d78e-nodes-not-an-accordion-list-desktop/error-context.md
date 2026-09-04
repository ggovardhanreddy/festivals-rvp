# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routes.spec.ts >> family tree is a genealogy diagram >> renders connecting lines and nodes, not an accordion list
- Location: tests/e2e/routes.spec.ts:122:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at /var/folders/12/zpctr9qj77v2ly90cr5xsw8c0000gn/T/cursor-sandbox-cache/d72bb1c932e887403ec3183cf55758a5/playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```