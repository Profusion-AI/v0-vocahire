import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TermsModal } from '../components/terms-modal';
import '@testing-library/jest-dom';

// Mock the IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
global.IntersectionObserver = MockIntersectionObserver;

describe('TermsModal', () => {
  const mockOnAgree = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Enable fake timers for setTimeout
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // Run any pending timers
    jest.useRealTimers(); // Restore real timers
  });

  it('renders correctly and shows "Please scroll to the bottom" initially', () => {
    render(
      <TermsModal open={true} onOpenChange={mockOnOpenChange} onAgree={mockOnAgree} />
    );

    expect(screen.getByText('VocaHire Coach Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Please scroll to the bottom to accept.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Please scroll to the bottom' })).toBeDisabled();
  });

  it('enables "I Accept" button when scrolled to bottom', async () => {
    render(
      <TermsModal open={true} onOpenChange={mockOnOpenChange} onAgree={mockOnAgree} />
    );

    const scrollContainer = screen.getByText(/Welcome to VocaHire Coach/i).closest('div');
    if (scrollContainer) {
      // Simulate scrolling to the bottom
      Object.defineProperty(scrollContainer, 'scrollTop', { value: 1000, writable: true });
      Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(scrollContainer, 'clientHeight', { value: 0, writable: true }); // Simulate clientHeight being small for easy bottom detection
      fireEvent.scroll(scrollContainer);
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'I Accept' })).toBeEnabled();
    });
  });

  it('calls onAgree when "I Accept" button is clicked', async () => {
    render(
      <TermsModal open={true} onOpenChange={mockOnOpenChange} onAgree={mockOnAgree} />
    );

    const scrollContainer = screen.getByText(/Welcome to VocaHire Coach/i).closest('div');
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollTop', { value: 1000, writable: true });
      Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(scrollContainer, 'clientHeight', { value: 0, writable: true });
      fireEvent.scroll(scrollContainer);
    }

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'I Accept' }));
    });

    expect(mockOnAgree).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange when "Cancel" button is clicked', () => {
    render(
      <TermsModal open={true} onOpenChange={mockOnOpenChange} onAgree={mockOnAgree} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows checkbox fallback after 30 seconds if not scrolled', async () => {
    render(
      <TermsModal open={true} onOpenChange={mockOnOpenChange} onAgree={mockOnAgree} />
    );

    expect(screen.queryByLabelText('I have read and agree to the Terms of Service')).not.toBeInTheDocument();

    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(screen.getByLabelText('I have read and agree to the Terms of Service')).toBeInTheDocument();
    });
  });

  it('enables "I Accept" button when fallback checkbox is checked', async () => {
    render(
      <TermsModal open={true} onOpenChange={mockOnOpenChange} onAgree={mockOnAgree} />
    );

    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      const checkbox = screen.getByLabelText('I have read and agree to the Terms of Service');
      fireEvent.click(checkbox);
      expect(screen.getByRole('button', { name: 'I Accept' })).toBeEnabled();
    });
  });

  it('resets scroll state and fallback checkbox when modal re-opens', async () => {
    const { rerender } = render(
      <TermsModal open={true} onOpenChange={mockOnOpenChange} onAgree={mockOnAgree} />
    );

    // Simulate initial scroll to bottom
    const scrollContainer = screen.getByText(/Welcome to VocaHire Coach/i).closest('div');
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollTop', { value: 1000, writable: true });
      Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(scrollContainer, 'clientHeight', { value: 0, writable: true });
      fireEvent.scroll(scrollContainer);
    }
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'I Accept' })).toBeEnabled();
    });

    // Close and re-open modal
    rerender(<TermsModal open={false} onOpenChange={mockOnOpenChange} onAgree={mockOnAgree} />);
    rerender(<TermsModal open={true} onOpenChange={mockOnOpenChange} onAgree={mockOnAgree} />);

    // Expect button to be disabled again and fallback checkbox not visible
    expect(screen.getByRole('button', { name: 'Please scroll to the bottom' })).toBeDisabled();
    expect(screen.queryByLabelText('I have read and agree to the Terms of Service')).not.toBeInTheDocument();
  });
});
