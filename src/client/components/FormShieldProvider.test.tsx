/**
 * FormShieldProvider Component Tests
 *
 * @module client/components/FormShieldProvider.test
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormShieldProvider } from "./FormShieldProvider";
import { useFormShieldContext } from "../FormShieldContext";
import { useFormShield } from "../hooks/useFormShield";
import { AntiSpamSettings } from "../types";

// Mock component to test context values
const ContextConsumer = () => {
    const context = useFormShieldContext();
    return (
        <div>
            <div data-testid="honeypot-field-name">
                {context.honeypotFieldName || "none"}
            </div>
            <div data-testid="enable-honeypot">
                {context.settings.ENABLE_HONEYPOT.toString()}
            </div>
            <div data-testid="enable-time-delay">
                {context.settings.ENABLE_TIME_DELAY.toString()}
            </div>
            <div data-testid="enable-challenge-dialog">
                {context.settings.ENABLE_CHALLENGE_DIALOG.toString()}
            </div>
        </div>
    );
};

// Mock component to test useFormShield with context
const HookConsumer = () => {
    const { settings, honeypotProps } = useFormShield();
    return (
        <div>
            <div data-testid="hook-honeypot-name">{honeypotProps.name}</div>
            <div data-testid="hook-enable-honeypot">
                {settings.ENABLE_HONEYPOT.toString()}
            </div>
            <div data-testid="hook-enable-time-delay">
                {settings.ENABLE_TIME_DELAY.toString()}
            </div>
            <div data-testid="hook-enable-challenge-dialog">
                {settings.ENABLE_CHALLENGE_DIALOG.toString()}
            </div>
        </div>
    );
};

// Mock component to test useFormShield with context and local options
const HookWithOptionsConsumer = () => {
    const localSettings: Partial<AntiSpamSettings> = {
        ENABLE_HONEYPOT: false,
        ENABLE_TIME_DELAY: false,
    };

    const { settings, honeypotProps } = useFormShield({
        settings: localSettings,
        honeypotFieldName: "custom_honeypot_field",
    });

    return (
        <div>
            <div data-testid="hook-options-honeypot-name">
                {honeypotProps.name}
            </div>
            <div data-testid="hook-options-enable-honeypot">
                {settings.ENABLE_HONEYPOT.toString()}
            </div>
            <div data-testid="hook-options-enable-time-delay">
                {settings.ENABLE_TIME_DELAY.toString()}
            </div>
            <div data-testid="hook-options-enable-challenge-dialog">
                {settings.ENABLE_CHALLENGE_DIALOG.toString()}
            </div>
        </div>
    );
};

describe("FormShieldProvider", () => {
    it("provides default context values when no props are provided", () => {
        render(
            <FormShieldProvider>
                <ContextConsumer />
            </FormShieldProvider>
        );

        expect(screen.getByTestId("honeypot-field-name")).toHaveTextContent(
            "none"
        );
        expect(screen.getByTestId("enable-honeypot")).toHaveTextContent("true");
        expect(screen.getByTestId("enable-time-delay")).toHaveTextContent(
            "true"
        );
        expect(screen.getByTestId("enable-challenge-dialog")).toHaveTextContent(
            "true"
        );
    });

    it("provides custom context values when props are provided", () => {
        const customSettings: Partial<AntiSpamSettings> = {
            ENABLE_HONEYPOT: false,
            ENABLE_TIME_DELAY: false,
            ENABLE_CHALLENGE_DIALOG: false,
        };

        render(
            <FormShieldProvider
                settings={customSettings}
                honeypotFieldName="test_honeypot_field">
                <ContextConsumer />
            </FormShieldProvider>
        );

        expect(screen.getByTestId("honeypot-field-name")).toHaveTextContent(
            "test_honeypot_field"
        );
        expect(screen.getByTestId("enable-honeypot")).toHaveTextContent(
            "false"
        );
        expect(screen.getByTestId("enable-time-delay")).toHaveTextContent(
            "false"
        );
        expect(screen.getByTestId("enable-challenge-dialog")).toHaveTextContent(
            "false"
        );
    });

    it("useFormShield hook uses context values", () => {
        const customSettings: Partial<AntiSpamSettings> = {
            ENABLE_HONEYPOT: false,
            ENABLE_TIME_DELAY: false,
            ENABLE_CHALLENGE_DIALOG: false,
        };

        render(
            <FormShieldProvider
                settings={customSettings}
                honeypotFieldName="test_honeypot_field">
                <HookConsumer />
            </FormShieldProvider>
        );

        expect(screen.getByTestId("hook-honeypot-name")).toHaveTextContent(
            "test_honeypot_field"
        );
        expect(screen.getByTestId("hook-enable-honeypot")).toHaveTextContent(
            "false"
        );
        expect(screen.getByTestId("hook-enable-time-delay")).toHaveTextContent(
            "false"
        );
        expect(
            screen.getByTestId("hook-enable-challenge-dialog")
        ).toHaveTextContent("false");
    });

    it("useFormShield hook options override context values", () => {
        const contextSettings: Partial<AntiSpamSettings> = {
            ENABLE_HONEYPOT: true,
            ENABLE_TIME_DELAY: true,
            ENABLE_CHALLENGE_DIALOG: false,
        };

        render(
            <FormShieldProvider
                settings={contextSettings}
                honeypotFieldName="context_honeypot_field">
                <HookWithOptionsConsumer />
            </FormShieldProvider>
        );

        // Hook options should override context values
        expect(
            screen.getByTestId("hook-options-honeypot-name")
        ).toHaveTextContent("custom_honeypot_field");
        expect(
            screen.getByTestId("hook-options-enable-honeypot")
        ).toHaveTextContent("false");
        expect(
            screen.getByTestId("hook-options-enable-time-delay")
        ).toHaveTextContent("false");

        // This value should come from context since it's not overridden in hook options
        expect(
            screen.getByTestId("hook-options-enable-challenge-dialog")
        ).toHaveTextContent("false");
    });
});
