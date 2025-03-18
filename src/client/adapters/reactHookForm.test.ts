/**
 * React Hook Form Adapter Tests
 *
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { withReactHookForm } from "./reactHookForm";
import { useFormShield } from "../hooks/useFormShield";

// Mock useFormShield hook
jest.mock("../hooks/useFormShield", () => ({
    useFormShield: jest.fn(),
}));

describe("withReactHookForm", () => {
    // Setup mock data
    const mockFormShield = {
        firstFocusTime: 1234567890,
        formFocusTracked: { current: true },
        requiredDelay: 10,
        showChallengeDialog: false,
        setShowChallengeDialog: jest.fn(),
        challenge: { question: "What is 2+2?", answer: "4" },
        setChallenge: jest.fn(),
        challengeAnswer: "",
        setChallengeAnswer: jest.fn(),
        formValues: null,
        setFormValues: jest.fn(),
        challengeMetrics: {
            completedChallenges: 0,
            totalChallengeTime: 0,
            requiredChallenges: 0,
        },
        setChallengeMetrics: jest.fn(),
        currentChallengeNumber: 1,
        handleFieldFocus: jest.fn(),
        checkAntiSpam: jest.fn(),
        handleChallengeSubmit: jest.fn(),
        honeypotProps: {
            name: "honeypot_field",
            style: {
                position: "absolute",
                left: "-9999px",
            },
        },
        getFormShieldData: jest.fn().mockReturnValue({
            firstFocusTime: 1234567890,
            submissionTime: 1234567900,
            challengeCompleted: false,
            challengeMetrics: {
                completedChallenges: 0,
                totalChallengeTime: 0,
                requiredChallenges: 0,
            },
            antiSpamSettings: {
                ENABLE_TIME_DELAY: true,
                ENABLE_CHALLENGE_DIALOG: true,
                ENABLE_HONEYPOT: true,
                ENABLE_MULTIPLE_CHALLENGES: true,
                CHALLENGE_TIME_VALUE: 5,
                MAX_CHALLENGES: 3,
            },
        }),
        validateSubmission: jest.fn().mockReturnValue({
            passed: true,
            isBot: false,
            timeDelayPassed: true,
            errorMessage: null,
            timeDeficitSeconds: 0,
            requiredChallenges: 0,
        }),
        settings: {
            ENABLE_TIME_DELAY: true,
            ENABLE_CHALLENGE_DIALOG: true,
            ENABLE_HONEYPOT: true,
            ENABLE_MULTIPLE_CHALLENGES: true,
            CHALLENGE_TIME_VALUE: 5,
            MAX_CHALLENGES: 3,
        },
    };

    // Mock the useFormShield implementation
    (useFormShield as jest.Mock).mockReturnValue(mockFormShield);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return enhanced register and handleSubmit functions", () => {
        // Setup
        const { result } = renderHook(() => {
            const form = useForm();
            return withReactHookForm(form);
        });

        // Verify the returned object has the expected properties
        expect(result.current).toHaveProperty("register");
        expect(result.current).toHaveProperty("handleSubmit");
        expect(result.current).toHaveProperty("honeypotProps");
        expect(result.current).toHaveProperty("showChallengeDialog");
        expect(result.current).toHaveProperty("setShowChallengeDialog");
        expect(result.current).toHaveProperty("challenge");
        expect(result.current).toHaveProperty("challengeAnswer");
        expect(result.current).toHaveProperty("setChallengeAnswer");
        expect(result.current).toHaveProperty("handleChallengeSubmit");
        expect(result.current).toHaveProperty("getFormShieldData");
    });

    it("should call useFormShield with the provided options", () => {
        // Setup
        const options = {
            onError: jest.fn(),
            onSubmitError: jest.fn(),
            honeypotFieldName: "custom_honeypot",
        };

        renderHook(() => {
            const form = useForm();
            return withReactHookForm(form, options);
        });

        // Verify useFormShield was called with the correct options
        expect(useFormShield).toHaveBeenCalledWith({
            ...options,
            onError: expect.any(Function),
        });
    });

    it("should enhance register to track field focus", () => {
        // Setup
        const mockAddEventListener = jest.fn();
        const mockElement = { addEventListener: mockAddEventListener };

        const mockRegister = jest.fn().mockReturnValue({
            name: "test",
            onBlur: jest.fn(),
            onChange: jest.fn(),
            ref: jest.fn(),
        });

        const mockForm = {
            register: mockRegister,
            handleSubmit: jest.fn(),
        };

        const { result } = renderHook(() => withReactHookForm(mockForm as any));

        // Call the enhanced register function
        const registration = result.current.register("test") as any;

        // Verify the registration has the expected properties
        expect(registration).toHaveProperty("ref");
        expect(registration).toHaveProperty("onBlur");
        expect(registration).toHaveProperty("onChange");

        // Simulate ref callback
        act(() => {
            registration.ref(mockElement);
        });

        // Verify event listener was added
        expect(mockAddEventListener).toHaveBeenCalledWith('focus', expect.any(Function));

        // Simulate focus event
        const focusHandler = mockAddEventListener.mock.calls[0][1];
        act(() => {
            focusHandler();
        });

        // Verify handleFieldFocus was called
        expect(mockFormShield.handleFieldFocus).toHaveBeenCalled();
    });

    it("should enhance handleSubmit to validate submission", async () => {
        // Setup
        const mockHandleSubmit = jest.fn().mockImplementation((onValid) => {
            return (e: any) => {
                e?.preventDefault?.();
                return onValid({ name: "Test" });
            };
        });

        const mockForm = {
            register: jest.fn(),
            handleSubmit: mockHandleSubmit,
        };

        const onValid = jest.fn().mockResolvedValue(undefined);
        const onInvalid = jest.fn();

        const { result } = renderHook(() => withReactHookForm(mockForm as any));

        // Call the enhanced handleSubmit function
        const enhancedSubmit = result.current.handleSubmit(onValid, onInvalid);

        // Simulate a submit event
        const mockEvent = {
            preventDefault: jest.fn(),
            nativeEvent: {} as Event,
            currentTarget: {} as EventTarget & Element,
            target: {} as EventTarget & Element,
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: true,
            timeStamp: Date.now(),
            type: 'submit',
            isDefaultPrevented: () => false,
            isPropagationStopped: () => false,
            persist: () => { },
            stopPropagation: () => { }
        } as any;

        await act(async () => {
            await enhancedSubmit(mockEvent);
        });

        // Verify validateSubmission was called
        expect(mockFormShield.validateSubmission).toHaveBeenCalledWith({ name: "Test" });

        // Verify onValid was called since validation passed
        expect(onValid).toHaveBeenCalledWith({ name: "Test" });
    });

    it("should not call onValid when validation fails", async () => {
        // Setup
        const mockHandleSubmit = jest.fn().mockImplementation((onValid) => {
            return (e: any) => {
                e?.preventDefault?.();
                return onValid({ name: "Test" });
            };
        });

        const mockForm = {
            register: jest.fn(),
            handleSubmit: mockHandleSubmit,
        };

        // Mock validation failure
        (mockFormShield.validateSubmission as jest.Mock).mockReturnValueOnce({
            passed: false,
            isBot: false,
            timeDelayPassed: false,
            errorMessage: "Form submitted too quickly",
            timeDeficitSeconds: 5,
            requiredChallenges: 1,
        });

        const onValid = jest.fn().mockResolvedValue(undefined);
        const onInvalid = jest.fn();

        const { result } = renderHook(() => withReactHookForm(mockForm as any));

        // Call the enhanced handleSubmit function
        const enhancedSubmit = result.current.handleSubmit(onValid, onInvalid);

        // Simulate a submit event
        const mockEvent = {
            preventDefault: jest.fn(),
            nativeEvent: {} as Event,
            currentTarget: {} as EventTarget & Element,
            target: {} as EventTarget & Element,
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: true,
            timeStamp: Date.now(),
            type: 'submit',
            isDefaultPrevented: () => false,
            isPropagationStopped: () => false,
            persist: () => { },
            stopPropagation: () => { }
        } as any;

        await act(async () => {
            await enhancedSubmit(mockEvent);
        });

        // Verify validateSubmission was called
        expect(mockFormShield.validateSubmission).toHaveBeenCalledWith({ name: "Test" });

        // Verify onValid was not called since validation failed
        expect(onValid).not.toHaveBeenCalled();
    });

    it("should call both onSubmitError and onError when provided", () => {
        // Setup
        const onError = jest.fn();
        const onSubmitError = jest.fn();

        renderHook(() => {
            const form = useForm();
            return withReactHookForm(form, { onError, onSubmitError });
        });

        // Get the onError function that was passed to useFormShield
        const passedOptions = (useFormShield as jest.Mock).mock.calls[0][0];
        const passedOnError = passedOptions.onError;

        // Call the onError function
        passedOnError("Test error");

        // Verify both error handlers were called
        expect(onError).toHaveBeenCalledWith("Test error");
        expect(onSubmitError).toHaveBeenCalledWith("Test error");
    });
});
