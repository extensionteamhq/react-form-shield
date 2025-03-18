import React from "react";
import type { ReactElement } from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";

// Define a custom render function that includes any global providers
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, "wrapper">
) => rtlRender(ui, { ...options });

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Override the render method
export { customRender as render };

// Helper function to create a mock event
export const createMockEvent = (overrides = {}) => ({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: { value: "" },
    ...overrides,
});

// Helper function to wait for a specified time
export const waitFor = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to mock the window.fetch API
export const mockFetch = (data: any) => {
    const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(data),
        text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    };

    const originalFetch = window.fetch;
    window.fetch = jest.fn().mockResolvedValue(mockResponse) as any;

    return {
        mockResponse,
        mockFetch: window.fetch,
        restore: () => {
            window.fetch = originalFetch;
        },
    };
};

// Helper function to create a mock form event
export const createMockFormEvent = (formData = {}) => {
    // Create a mock form with the provided data
    const form = document.createElement("form");
    Object.entries(formData).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.name = name;
        input.value = String(value);
        form.appendChild(input);
    });

    // Create a mock event with the form as the target
    return {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: form,
    };
};
