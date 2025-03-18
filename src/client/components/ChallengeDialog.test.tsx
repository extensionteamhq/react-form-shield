import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChallengeDialog } from "./ChallengeDialog";
import { Challenge } from "../types";

describe("ChallengeDialog", () => {
    // Mock challenge data
    const mockChallenge: Challenge = {
        question: "What is 2 + 2?",
        answer: "4",
    };

    // Mock functions
    const mockOnOpenChange = jest.fn();
    const mockSetChallengeAnswer = jest.fn();
    const mockOnSubmit = jest.fn().mockImplementation(() => Promise.resolve());

    // Default props
    const defaultProps = {
        open: true,
        onOpenChange: mockOnOpenChange,
        challenge: mockChallenge,
        challengeAnswer: "",
        setChallengeAnswer: mockSetChallengeAnswer,
        onSubmit: mockOnSubmit,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders nothing when open is false", () => {
        const { container } = render(
            <ChallengeDialog {...defaultProps} open={false} />
        );
        expect(container.firstChild).toBeNull();
    });

    it("renders the dialog with default title when open is true", () => {
        render(<ChallengeDialog {...defaultProps} />);
        expect(screen.getByText("Human Verification")).toBeInTheDocument();
    });

    it("renders the challenge question", () => {
        render(<ChallengeDialog {...defaultProps} />);
        expect(screen.getByText(mockChallenge.question)).toBeInTheDocument();
    });

    it("renders a custom title when provided", () => {
        const customTitle = "Custom Verification";
        render(<ChallengeDialog {...defaultProps} title={customTitle} />);
        expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    it("renders a default description when not provided", () => {
        render(<ChallengeDialog {...defaultProps} />);
        expect(
            screen.getByText(
                "Please answer the following question to verify you're human."
            )
        ).toBeInTheDocument();
    });

    it("renders a custom description when provided", () => {
        const customDescription = "This is a custom description";
        render(
            <ChallengeDialog
                {...defaultProps}
                description={customDescription}
            />
        );
        expect(screen.getByText(customDescription)).toBeInTheDocument();
    });

    it("renders a multiple challenge description when multipleEnabled is true", () => {
        render(
            <ChallengeDialog
                {...defaultProps}
                multipleEnabled={true}
                currentChallengeNumber={1}
                totalRequiredChallenges={3}
            />
        );
        expect(screen.getByText(/Challenge 1 of 3/)).toBeInTheDocument();
    });

    it("calls setChallengeAnswer when input value changes", () => {
        render(<ChallengeDialog {...defaultProps} />);
        const input = screen.getByLabelText(mockChallenge.question);
        fireEvent.change(input, { target: { value: "4" } });
        expect(mockSetChallengeAnswer).toHaveBeenCalledWith("4");
    });

    it("calls onSubmit when the verify button is clicked", () => {
        render(<ChallengeDialog {...defaultProps} challengeAnswer="4" />);
        const button = screen.getByText("Verify");
        fireEvent.click(button);
        expect(mockOnSubmit).toHaveBeenCalled();
    });

    it("calls onSubmit when Enter key is pressed and answer is not empty", () => {
        render(<ChallengeDialog {...defaultProps} challengeAnswer="4" />);
        const input = screen.getByLabelText(mockChallenge.question);
        fireEvent.keyDown(input, { key: "Enter" });
        expect(mockOnSubmit).toHaveBeenCalled();
    });

    it("does not call onSubmit when Enter key is pressed and answer is empty", () => {
        render(<ChallengeDialog {...defaultProps} challengeAnswer="" />);
        const input = screen.getByLabelText(mockChallenge.question);
        fireEvent.keyDown(input, { key: "Enter" });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("calls onOpenChange with false when cancel button is clicked", () => {
        render(<ChallengeDialog {...defaultProps} />);
        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("disables the verify button when answer is empty", () => {
        render(<ChallengeDialog {...defaultProps} challengeAnswer="" />);
        const button = screen.getByText("Verify");
        expect(button).toBeDisabled();
    });

    it("enables the verify button when answer is not empty", () => {
        render(<ChallengeDialog {...defaultProps} challengeAnswer="4" />);
        const button = screen.getByText("Verify");
        expect(button).not.toBeDisabled();
    });

    it("renders error message when error is provided", () => {
        const errorMessage = "Incorrect answer";
        render(<ChallengeDialog {...defaultProps} error={errorMessage} />);
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("uses custom button text when provided", () => {
        const customButtonText = "Submit Answer";
        render(
            <ChallengeDialog {...defaultProps} buttonText={customButtonText} />
        );
        expect(screen.getByText(customButtonText)).toBeInTheDocument();
    });
});
