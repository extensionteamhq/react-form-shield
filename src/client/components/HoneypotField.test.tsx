import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HoneypotField } from "./HoneypotField";
import { getHoneypotStyles } from "../utils";

// Mock the utils module
jest.mock("../utils", () => ({
    getHoneypotStyles: jest.fn().mockReturnValue({
        position: "absolute",
        left: "-9999px",
        opacity: 0,
        height: 0,
        width: 0,
        overflow: "hidden",
    }),
}));

describe("HoneypotField", () => {
    const defaultProps = {
        name: "test_honeypot",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders a hidden input field with the provided name", () => {
        render(<HoneypotField {...defaultProps} />);

        // Check that the input exists with the correct name
        // Use getBySelector instead of getByRole since the input is hidden
        const input = document.querySelector(
            `input[name="${defaultProps.name}"]`
        );
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("name", defaultProps.name);
        expect(input).toHaveAttribute("id", defaultProps.name);
    });

    it("applies honeypot styles to make the field invisible to humans", () => {
        render(<HoneypotField {...defaultProps} />);

        // Verify getHoneypotStyles was called
        expect(getHoneypotStyles).toHaveBeenCalled();

        // Check that the container has aria-hidden attribute
        const container = screen.getByText(
            "Please leave this field empty"
        ).parentElement;
        expect(container).toHaveAttribute("aria-hidden", "true");
    });

    it("sets tabIndex to -1 to prevent keyboard navigation", () => {
        render(<HoneypotField {...defaultProps} />);

        const input = document.querySelector(
            `input[name="${defaultProps.name}"]`
        );
        expect(input).toHaveAttribute("tabIndex", "-1");
    });

    it("sets autoComplete to off", () => {
        render(<HoneypotField {...defaultProps} />);

        const input = document.querySelector(
            `input[name="${defaultProps.name}"]`
        );
        expect(input).toHaveAttribute("autoComplete", "off");
    });

    it("merges custom styles with default styles", () => {
        const customStyle = { color: "red" };
        render(<HoneypotField {...defaultProps} style={customStyle} />);

        // The combined styles should include both default and custom styles
        const expectedStyles = {
            ...getHoneypotStyles(),
            ...customStyle,
        };

        // Check that the container has the combined styles
        const container = screen.getByText(
            "Please leave this field empty"
        ).parentElement;
        Object.entries(expectedStyles).forEach(([key, value]) => {
            expect(container).toHaveStyle(`${key}: ${value}`);
        });
    });
});
