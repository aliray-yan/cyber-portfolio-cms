# Test Guide

This document lists the tests currently included in the Cyber Portfolio CMS and explains how to run them.

## Test summary

| Test area | Location | Current coverage |
|---|---|---:|
| Component tests | `components/**/*.test.tsx` | 19 tests in 4 files |
| AI/data unit tests | `lib/ai/*.test.ts` | 11 tests in 2 files |
| End-to-end test | `e2e/primary-flow.spec.ts` | 1 scenario across Chromium, Firefox, and WebKit |

## Component tests

Run all React component tests with:

```bash
npm run test:components
```

These tests use Vitest, React Testing Library, and jsdom.

### `ChatMessage.test.tsx`

Tests:

- Visitor message text renders
- Assistant reply text renders
- Accessible responding status appears while waiting
- Empty streaming text does not create an empty message bubble
- Tool message parts are routed to the correct tool component

### `ChatWidget.test.tsx`

Tests:

- Suggested prompts appear when the assistant is first opened
- Input is disabled and Stop appears during a pending response
- A completed response renders and returns to the ready state
- Server errors appear as accessible alerts
- Retry and Dismiss controls appear after an error
- Dismissing an error removes the alert

### `SkillsRadarPart.test.tsx`

Tests the tool lifecycle states:

- `input-streaming`
- `input-available`
- `output-available`
- `output-error` with a real error message
- `output-error` with a fallback message

### `ContactForm.test.tsx`

Tests:

- Required-field validation
- Invalid email validation
- Too-short message validation
- Successful submission creates a `mailto:` link and confirmation status

## Unit tests

Run the AI/data unit tests with:

```bash
npm run test:unit
```

These use Node's built-in test runner.

### `lib/ai/errors.test.ts`

Tests safe error-message handling for:

- Rate limits (`429`)
- Provider outages (`5xx`)
- Other API errors
- Plain JavaScript errors and thrown strings
- Preventing URLs, stack traces, and API-key-shaped values from leaking

### `lib/ai/tools.test.ts`

Tests:

- Project searches with no matches
- Project category filtering
- Project result limits
- Unknown skill-category errors
- Partial and case-insensitive skill-category matching
- Returning all skill categories when no category is supplied

## End-to-end test

Run the Playwright test with:

```bash
npm run test:e2e
```

The test in `e2e/primary-flow.spec.ts` verifies the main visitor flow:

1. Open the homepage
2. Open the AI assistant
3. Send a question
4. Receive a mocked tool result and assistant response
5. Close the assistant
6. Navigate to Projects

The chat API is mocked, so the test does not require a real OpenRouter request. Playwright runs the scenario in Chromium, Firefox, and WebKit.

## Run the complete test suite

```bash
npm test
npm run test:e2e
```

`npm test` runs both the unit and component suites. The end-to-end suite is separate because it starts or reuses a Next.js server and launches browsers.

## Additional verification

Run linting:

```bash
npm run lint
```

Verify the production build:

```bash
npm run build
```

## Coverage

The project includes `@vitest/coverage-v8`, but coverage thresholds are not currently enforced in `vitest.config.ts`.

Generate a component coverage report with:

```bash
npm run test:components -- --coverage
```

The report is written to `coverage/`. Check the summary for the component coverage percentage and confirm it is at least 50% for the capstone requirement.

Because coverage is not yet configured as a failing threshold, a passing test command alone does not prove that the 50% requirement is met. Record the reported percentage in the capstone submission or add a Vitest coverage threshold when the final target is confirmed.

## Recommended verification order

For a quick local check:

```bash
npm run lint
npm test
npm run test:components -- --coverage
npm run build
```

For the full release check:

```bash
npm run lint
npm test
npm run test:components -- --coverage
npm run test:e2e
npm run build
```
