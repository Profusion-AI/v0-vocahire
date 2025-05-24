# OpenAI Voice Assistant Integration in Vocahire

## Overview

This document provides a comprehensive overview of how the OpenAI voice assistant is informed about the oncoming user in the Vocahire system. It includes detailed explanations of the components, data flows, and state transitions involved in the process.

## Table of Contents

1. [Interview Initiation](#interview-initiation)
2. [User Authentication](#user-authentication)
3. [Credit Validation](#credit-validation)
4. [Real-time Interview Session](#real-time-interview-session)
5. [OpenAI Integration](#openai-integration)
6. [WebRTC Setup](#webrtc-setup)
7. [Session Data](#session-data)
8. [Error Handling](#error-handling)
9. [Performance Monitoring](#performance-monitoring)
10. [Circuit Breaker](#circuit-breaker)

## Interview Initiation

The interview process begins when the user starts the interview session through the `InterviewPageClient` component. This component manages the state of the interview, including loading stages, user data, and session creation.

### State Transitions

- `idle` → `requesting_mic` → `testing_api` → `fetching_token` → `creating_offer` → `exchanging_sdp` → `connecting_webrtc` → `data_channel_open` → `active`

## User Authentication

The user is authenticated using Clerk, and their credentials are fetched from the database using optimized queries with caching and connection pooling.

### Data Flow

- User credentials are fetched from the database using the `getUserCredentialsOptimized` function.
- The function uses caching to improve performance and reduce database load.
- If the user is not found in the cache, a direct database query is performed.

## Credit Validation

The user's credits are checked, and the cost of the interview session is deducted from their account. If the user doesn't have enough credits, they are prompted to purchase more.

### Data Flow

- The `useUserData` hook fetches the user's credits and premium status.
- If the user doesn't have enough credits, an error message is displayed, and the user is prompted to purchase more credits.

## Real-time Interview Session

The `useRealtimeInterviewSession` hook manages the real-time interview session. It sets up WebRTC for real-time communication and integrates with OpenAI for the voice assistant.

### Data Flow

- The hook uses WebRTC to establish a real-time connection between the user and the AI voice assistant.
- Data channels are set up for real-time communication, including audio and text messages.

## OpenAI Integration

The API route in `app/api/realtime-session/route.ts` creates a session with OpenAI for the voice assistant. It includes instructions for the AI, such as the job title and any resume text provided by the user.

### Data Flow

- The API route sends a request to the OpenAI Realtime API to create a session.
- The request includes instructions for the AI, such as the job title and any resume text provided by the user.
- The OpenAI API returns a session ID, token, and expiration time, which are used to manage the interview session.

## WebRTC Setup

The WebRTC connection is established, and data channels are set up for real-time communication between the user and the AI voice assistant.

### Data Flow

- The hook uses WebRTC to establish a real-time connection between the user and the AI voice assistant.
- Data channels are set up for real-time communication, including audio and text messages.

## Session Data

The session data, including session ID, token, and expiration time, is returned to the client and used to manage the interview session.

### Data Flow

- The session data is stored in the `sessionDataRef` reference and used to manage the interview session.
- The session data is used to establish the WebRTC connection and set up data channels.

## Error Handling

Comprehensive error handling is implemented throughout the process to handle various scenarios, such as database connectivity issues, insufficient credits, and authentication errors.

### Data Flow

- Errors are caught and handled at various points in the process, including database queries, API requests, and WebRTC setup.
- Error messages are displayed to the user, and appropriate actions are taken, such as prompting the user to purchase more credits or retrying the connection.

## Performance Monitoring

Performance monitoring and logging are included to debug and optimize the process.

### Data Flow

- Performance metrics are logged at various points in the process, including database queries, API requests, and WebRTC setup.
- The logs are used to debug and optimize the process.

## Circuit Breaker

A circuit breaker is used to protect against OpenAI API failures.

### Data Flow

- The circuit breaker is used to wrap the API request to the OpenAI Realtime API.
- If the API request fails, the circuit breaker prevents further requests until the API is available again.

## Conclusion

This document provides a comprehensive overview of how the OpenAI voice assistant is informed about the oncoming user in the Vocahire system. It includes detailed explanations of the components, data flows, and state transitions involved in the process.
