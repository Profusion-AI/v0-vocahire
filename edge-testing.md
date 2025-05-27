edge-testing.md

### Comprehensive Edge Case Testing for VocaHire Coach

__Date:__ May 27, 2025 __Prepared For:__ VocaHire Coach Development Team (Cline & Claude) __Subject:__ Importance of Edge Case Testing and Comprehensive Testing Plan

__1. Why Edge Case Testing is Crucial for VocaHire Coach UX:__

VocaHire Coach aims to provide a seamless, low-latency, voice-driven AI mock interview experience. The core value proposition relies heavily on natural, real-time interaction. While the "happy path" (user follows the intended flow, system works perfectly) is essential, real-world usage is rarely perfect. Users may:

- __Deviate from the intended flow:__ Click buttons out of sequence, navigate away unexpectedly, or provide invalid input.
- __Encounter environmental issues:__ Lose network connection, have microphone problems, or experience browser glitches.
- __Interact in unexpected ways:__ Remain silent for long periods, interrupt the AI frequently, or provide very short/long responses.

If the application does not handle these situations gracefully, the user experience can quickly degrade. Instead of feeling like a helpful practice partner, VocaHire Coach could become frustrating, unreliable, and ultimately unusable. Proper UX handling of edge cases is vital to:

- __Maintain User Trust:__ Users need to feel confident that the application will behave predictably, even when things go wrong. Clear error messages and recovery options build trust.
- __Ensure Reliability:__ Graceful handling of errors and disconnections prevents crashes and ensures users can complete their practice sessions or recover easily.
- __Improve User Satisfaction:__ A polished experience that anticipates and handles unexpected scenarios leads to higher user satisfaction and retention.
- __Gather Meaningful Feedback:__ When errors occur, providing specific, actionable feedback to the user (and logging detailed information for developers) is crucial for debugging and improvement.
- __Support Scalability:__ A robust application that handles edge cases efficiently is better positioned to scale and handle a larger user base.

In a real-time, voice-driven application like VocaHire Coach, where the interaction is highly dynamic and dependent on external factors (network, microphone, AI model responsiveness), comprehensive edge case testing is not just a best practice – it's a necessity for delivering on the core promise of a natural and reliable practice partner.

__2. Comprehensive Edge Case Testing Plan:__

__Objective:__ Identify and test scenarios where users deviate from the primary interview flow or encounter unexpected conditions, ensuring the application handles these gracefully and provides appropriate feedback or recovery options.

__Scope:__ This plan focuses on testing edge cases within the frontend and its interaction with the real-time backend (Genkit-powered API route), based on the current architecture and implemented features (Phase 3 & 4). It includes scenarios related to user input, permissions, real-time connection, backend errors, data inconsistencies, and user navigation.

__Testing Strategy:__

- __Scenario Identification:__ Brainstorm potential deviations from the intended flow and unexpected conditions.
- __Test Case Definition:__ Define specific test cases for each scenario, including steps to reproduce, expected outcomes, and criteria for success.
- __Manual Testing:__ Execute test cases manually to simulate user behavior and observe application responses.
- __Automated Testing (where feasible):__ Implement automated tests (e.g., using Vitest/Jest, React Testing Library, Playwright, Cypress) for critical edge cases that can be reliably reproduced.
- __Logging and Monitoring:__ Leverage existing logging and monitoring tools (Sentry, console logs, network tabs) to identify errors and unexpected behavior during testing.

__Edge Case Scenarios and Test Cases:__

- __2.1. User Deviations in Session Setup (`SessionSetup.tsx`):__

  - __Scenario:__ User attempts to start an interview with incomplete or invalid setup data.

  - __Test Cases:__

    - Attempt to start without selecting Interview Type.
    - Attempt to start without entering Job Role.
    - Attempt to start without checking the Consent checkbox.
    - Enter invalid characters or excessive length in text inputs (Job Role).
    - Attempt to submit the form multiple times rapidly.

  - __Expected Outcome:__ Form validation prevents submission, clear error messages are displayed next to the relevant fields. `onSessionStart` is not called.

- __2.2. Microphone Permission Issues (`useAudioStream` hook, `InterviewControls.tsx`):__

  - __Scenario:__ User denies microphone permission, revokes permission during a session, or encounters microphone access errors.

  - __Test Cases:__

    - Deny microphone permission when prompted on the Session Setup page.
    - Deny microphone permission when prompted on the Live Interview page (if prompted there).
    - Revoke microphone permission via browser settings during an active interview session.
    - Simulate microphone access errors (e.g., by disabling the microphone device).

  - __Expected Outcome:__ Application detects permission denial/revocation, displays a clear message to the user explaining the issue and how to grant/re-grant permission. Interview cannot start or is gracefully ended if permission is lost during a session. Audio visualization and sending functions are disabled. The `useAudioStream` hook's state (`hasPermission`, `error`) is updated correctly.

- __2.3. Real-Time Connection Issues (`useGenkitRealtime` hook, API Route):__

  - __Scenario:__ Real-time connection fails to establish, is interrupted during a session, or encounters errors during data transfer.

  - __Test Cases:__

    - Attempt to connect with an invalid API URL.
    - Simulate network disconnection during the connection attempt.
    - Simulate network disconnection during an active interview session (frontend disconnect).
    - Simulate server-side disconnection (backend closes the connection).
    - Simulate network errors during data sending (e.g., `fetch` call fails).
    - Simulate receiving malformed or invalid data chunks from the SSE stream.
    - Simulate receiving error messages from the API route via the SSE stream.
    - Test reconnection attempts and eventual failure after `maxReconnectAttempts`.

  - __Expected Outcome:__ `useGenkitRealtime` hook detects the connection issue, updates `isConnected`, `isConnecting`, `status`, and `error` states. UI components (`SessionStatus`, error display) reflect the connection status and error details. Reconnection attempts are made (if configured). If reconnection fails, the session is gracefully ended, and the user is informed.

- __2.4. User Actions During Unexpected States:__

  - __Scenario:__ User attempts to perform actions (e.g., click Start/Stop, Toggle Mute) when the application is not in an appropriate state (e.g., not connected, connecting, error state).

  - __Test Cases:__

    - Click "Start Interview" when not connected or connecting.
    - Click "End Interview" when not in an active interview state.
    - Click "Toggle Microphone" when not in an active interview state.
    - Click "Toggle Speaker" when not in an active interview state.
    - Attempt to send audio data (if manually triggered for testing) when disconnected.
    - Attempt to interrupt the AI when not in a streaming or thinking state.

  - __Expected Outcome:__ Buttons are disabled when the action is not valid. Clicking disabled buttons has no effect. Functions like `sendData` or `interrupt` log a warning and do nothing when the hook is not in a connected state.

- __2.5. Backend/Genkit Flow Errors (Handled by API Route):__

  - __Scenario:__ Errors occur within the Genkit flow or its interactions with Google AI/database, and these errors are propagated to the frontend via the API route.

  - __Test Cases:__

    - Simulate a Genkit flow execution error (mocking the `runFlow` call in the API route to throw an error).
    - Simulate a validation error in the API route (e.g., sending data that doesn't match `RealtimeInputSchema`).
    - Simulate an error from the `GoogleLiveAPIClient` within the API route.
    - Simulate receiving an error message via the SSE stream with a specific error code (e.g., related to AI model issues, database errors).

  - __Expected Outcome:__ The API route catches the error, formats it into the standardized error schema, and sends it to the frontend via the SSE stream. The frontend (`useGenkitRealtime` hook, error display) receives and displays the error to the user. The application state transitions to an error state.

- __2.6. Data Inconsistencies and Edge Cases:__

  - __Scenario:__ The application receives data that is valid according to schemas but represents an edge case (e.g., empty transcript, very short AI response, delayed audio chunk, empty feedback object).

  - __Test Cases:__

    - Simulate an interview where the user says nothing.
    - Simulate an interview where the AI says nothing or gives very short responses.
    - Simulate receiving audio chunks with significant delays or out of order (if possible with SSE).
    - Simulate receiving an empty feedback object after a session.
    - Simulate receiving transcript updates that require appending to the previous entry.

  - __Expected Outcome:__ UI components handle these cases gracefully (e.g., display "No transcript", handle empty feedback sections). The application does not crash or enter an inconsistent state. Transcript updates are handled correctly, even for incremental chunks.

- __2.7. User Navigation:__

  - __Scenario:__ User navigates away from the interview page during an active session.

  - __Test Cases:__

    - Navigate to another page using `next/link` or `router.push` during an active session.
    - Close the browser tab or window during an active session.

  - __Expected Outcome:__ The `useGenkitRealtime` hook's cleanup logic is triggered (`disconnect` is called), gracefully ending the real-time connection and informing the backend. The session is not left hanging open on the server.

__3. Implementation of Test Cases:__

- __Manual Testing:__ Follow the steps defined in the test cases manually in a development environment.

- __Automated Testing:__

  - __Unit Tests (Vitest/Jest, React Testing Library):__ Focus on testing hooks (`useGenkitRealtime`, `useAudioStream`) and individual components in isolation. Mock dependencies like `fetch`, `WebSocket`, `MediaDevices`, `AudioContext`, and the API route.
  - __Integration Tests:__ Test the interaction between components and hooks.
  - __API Route Tests:__ Test the server-side logic in `app/api/interview-v2/session/route.ts`, mocking Genkit flow execution and external API calls (Google AI, database).
  - __End-to-End Tests (Playwright/Cypress):__ Cover critical user flows and edge cases in a real browser environment. Mock API responses to simulate backend behavior and errors.

__4. Prioritization:__

Prioritize testing of critical paths and scenarios that could lead to a broken user experience or data inconsistencies:

1. Microphone permission issues.
2. Real-time connection failures and interruptions.
3. Backend/Genkit flow errors.
4. User navigation away from the page.
5. Form validation edge cases.
6. Data inconsistencies in transcript and feedback display.
7. User actions during unexpected states.

This document serves as a guide for ensuring the robustness and user-friendliness of VocaHire Coach by systematically testing edge cases.
