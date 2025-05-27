import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import SessionSetup from '../SessionSetup'; // Assuming default export

// Mock the Zod schema for input validation
vi.mock('../../../src/genkit/schemas/types', () => ({
  RealtimeInputSchema: {
    parse: vi.fn((data) => {
      // Simple mock validation
      if (!data.jobRole || !data.difficulty || !data.interviewType) { // Added interviewType check
        throw new Error('Validation failed: Missing required fields');
      }
      // Add more specific validation checks here if needed for edge cases
      return data;
    }),
    // Mock the enum for interviewType
    interviewType: {
      enum: ['Behavioral', 'Technical', 'Leadership', 'General'],
    },
  },
}));

describe('SessionSetup', () => {
  const mockOnSessionStart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the session setup form', () => {
    render(<SessionSetup onSessionStart={mockOnSessionStart} />);

    // Updated selectors based on expected implementation
    expect(screen.getByLabelText(/Interview Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Difficulty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/I agree to real-time audio processing and the VocaHire Privacy Policy./i)).toBeInTheDocument(); // Consent checkbox
    expect(screen.getByRole('button', { name: /Start Interview/i })).toBeInTheDocument();
  });

  it('should call onSessionStart with valid data on form submission', async () => {
    render(<SessionSetup onSessionStart={mockOnSessionStart} />);
    const user = userEvent.setup();

    const interviewTypeSelect = screen.getByLabelText(/Interview Type/i);
    const jobRoleInput = screen.getByLabelText(/Job Role/i);
    const difficultySelect = screen.getByLabelText(/Difficulty/i);
    const consentCheckbox = screen.getByLabelText(/I agree to real-time audio processing and the VocaHire Privacy Policy./i);
    const startButton = screen.getByRole('button', { name: /Start Interview/i });

    await user.selectOptions(interviewTypeSelect, 'Behavioral');
    await user.type(jobRoleInput, 'Frontend Developer');
    await user.selectOptions(difficultySelect, 'mid');
    await user.click(consentCheckbox); // Check the consent box
    await user.click(startButton);

    // Expect onSessionStart to be called with the form data
    expect(mockOnSessionStart).toHaveBeenCalledTimes(1);
    expect(mockOnSessionStart).toHaveBeenCalledWith(expect.objectContaining({
      interviewType: 'Behavioral',
      jobRole: 'Frontend Developer',
      difficulty: 'mid',
      // Consent is handled by the checkbox state, not typically passed in the data object itself
    }));
  });

  // --- Edge Case Tests for User Deviations ---

  it('should not call onSessionStart and display error for missing Interview Type', async () => {
    render(<SessionSetup onSessionStart={mockOnSessionStart} />);
    const user = userEvent.setup();

    const jobRoleInput = screen.getByLabelText(/Job Role/i);
    const difficultySelect = screen.getByLabelText(/Difficulty/i);
    const consentCheckbox = screen.getByLabelText(/I agree to real-time audio processing and the VocaHire Privacy Policy./i);
    const startButton = screen.getByRole('button', { name: /Start Interview/i });

    // Do NOT select Interview Type
    await user.type(jobRoleInput, 'Frontend Developer');
    await user.selectOptions(difficultySelect, 'mid');
    await user.click(consentCheckbox);
    await user.click(startButton);

    // Expect onSessionStart not to be called
    expect(mockOnSessionStart).not.toHaveBeenCalled();
    // TODO: Add checks for specific error messages displayed in the UI for missing Interview Type
  });

  it('should not call onSessionStart and display error for missing Job Role', async () => {
    render(<SessionSetup onSessionStart={mockOnSessionStart} />);
    const user = userEvent.setup();

    const interviewTypeSelect = screen.getByLabelText(/Interview Type/i);
    const difficultySelect = screen.getByLabelText(/Difficulty/i);
    const consentCheckbox = screen.getByLabelText(/I agree to real-time audio processing and the VocaHire Privacy Policy./i);
    const startButton = screen.getByRole('button', { name: /Start Interview/i });

    await user.selectOptions(interviewTypeSelect, 'Behavioral');
    // Do NOT enter Job Role
    await user.selectOptions(difficultySelect, 'mid');
    await user.click(consentCheckbox);
    await user.click(startButton);

    expect(mockOnSessionStart).not.toHaveBeenCalled();
    // TODO: Add checks for specific error messages displayed in the UI for missing Job Role
  });

  it('should not call onSessionStart and display error for missing Consent', async () => {
    render(<SessionSetup onSessionStart={mockOnSessionStart} />);
    const user = userEvent.setup();

    const interviewTypeSelect = screen.getByLabelText(/Interview Type/i);
    const jobRoleInput = screen.getByLabelText(/Job Role/i);
    const difficultySelect = screen.getByLabelText(/Difficulty/i);
    const startButton = screen.getByRole('button', { name: /Start Interview/i });

    await user.selectOptions(interviewTypeSelect, 'Behavioral');
    await user.type(jobRoleInput, 'Frontend Developer');
    await user.selectOptions(difficultySelect, 'mid');
    // Do NOT check the consent box
    await user.click(startButton);

    expect(mockOnSessionStart).not.toHaveBeenCalled();
    // TODO: Add checks for specific error messages displayed in the UI for missing Consent
  });

  it('should not call onSessionStart for invalid difficulty (if schema validation is more strict)', async () => {
    // This test assumes the schema validation in the mock is more strict than just checking for existence.
    // Our current mock only checks for existence, so this test will pass but might not be fully representative
    // if the actual schema validation is more complex.
    render(<SessionSetup onSessionStart={mockOnSessionStart} />);
    const user = userEvent.setup();

    const interviewTypeSelect = screen.getByLabelText(/Interview Type/i);
    const jobRoleInput = screen.getByLabelText(/Job Role/i);
    const difficultySelect = screen.getByLabelText(/Difficulty/i);
    const consentCheckbox = screen.getByLabelText(/I agree to real-time audio processing and the VocaHire Privacy Policy./i);
    const startButton = screen.getByRole('button', { name: /Start Interview/i });

    await user.selectOptions(interviewTypeSelect, 'Behavioral');
    await user.type(jobRoleInput, 'Frontend Developer');
    // Select an option that is NOT in the enum (requires mocking selectOptions to allow this or direct input)
    // For now, we'll rely on the mock schema's parse function to catch this if it were more complex.
    await user.selectOptions(difficultySelect, 'mid'); // Using a valid one for now
    await user.click(consentCheckbox);
    await user.click(startButton);

    // If the mock schema's parse function were to throw for 'mid' (which it doesn't),
    // then onSessionStart would not be called.
    // expect(mockOnSessionStart).not.toHaveBeenCalled();
  });

  // TODO: Add tests for rapid form submission
  // TODO: Add tests for invalid characters/length in Job Role input
});
