/**
 * Formik Adapter Tests
 *
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useFormik } from "formik";
import { withFormik } from "./formik";
import { useFormShield } from "../hooks/useFormShield";

// Mock useFormShield hook
jest.mock("../hooks/useFormShield", () => ({
    useFormShield: jest.fn(),
}));

describe("withFormik", () => {
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

    it("should return enhanced handleSubmit function and form shield props", () => {
        // Setup
        const { result } = renderHook(() => {
            const formik = useFormik({
                initialValues: { name: "", email: "" },
                onSubmit: jest.fn(),
            });
            return withFormik(formik);
        });

        // Verify the returned object has the expected properties
        expect(result.current).toHaveProperty("getFieldProps");
        expect(result.current).toHaveProperty("handleSubmit");
        expect(result.current).toHaveProperty("handleFieldFocus");
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
            const formik = useFormik({
                initialValues: { name: "", email: "" },
                onSubmit: jest.fn(),
            });
            return withFormik(formik, options);
        });

        // Verify useFormShield was called with the correct options
        expect(useFormShield).toHaveBeenCalledWith({
            ...options,
            onError: expect.any(Function),
        });
    });

    it("should expose handleFieldFocus to track field focus", () => {
        // Setup
        const { result } = renderHook(() => {
            const formik = useFormik({
                initialValues: { name: "", email: "" },
                onSubmit: jest.fn(),
            });
            return withFormik(formik);
        });

        // Call the handleFieldFocus function
        act(() => {
            result.current.handleFieldFocus();
        });

        // Verify handleFieldFocus was called
        expect(mockFormShield.handleFieldFocus).toHaveBeenCalled();
    });

    it("should enhance handleSubmit to validate submission", async () => {
        // Setup
        const mockSubmitForm = jest.fn().mockResolvedValue(undefined);
        const mockFormik = {
            values: { name: "Test", email: "test@example.com" },
            submitForm: mockSubmitForm,
            getFieldProps: jest.fn().mockReturnValue({
                name: "name",
                value: "Test",
                onChange: jest.fn(),
                onBlur: jest.fn(),
            }),
        };

        const { result } = renderHook(() => withFormik(mockFormik as any));

        // Call the enhanced handleSubmit function
        const mockEvent = {
            preventDefault: jest.fn(),
        } as any;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });

        // Verify preventDefault was called
        expect(mockEvent.preventDefault).toHaveBeenCalled();

        // Verify validateSubmission was called with the form values
        expect(mockFormShield.validateSubmission).toHaveBeenCalledWith({
            name: "Test",
            email: "test@example.com",
        });

        // Verify submitForm was called since validation passed
        expect(mockSubmitForm).toHaveBeenCalled();
    });

    it("should not call submitForm when validation fails", async () => {
        // Setup
        const mockSubmitForm = jest.fn().mockResolvedValue(undefined);
        const mockFormik = {
            values: { name: "Test", email: "test@example.com" },
            submitForm: mockSubmitForm,
            getFieldProps: jest.fn().mockReturnValue({
                name: "name",
                value: "Test",
                onChange: jest.fn(),
                onBlur: jest.fn(),
            }),
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

        const { result } = renderHook(() => withFormik(mockFormik as any));

        // Call the enhanced handleSubmit function
        await act(async () => {
            await result.current.handleSubmit();
        });

        // Verify validateSubmission was called
        expect(mockFormShield.validateSubmission).toHaveBeenCalledWith({
            name: "Test",
            email: "test@example.com",
        });

        // Verify submitForm was not called since validation failed
        expect(mockSubmitForm).not.toHaveBeenCalled();
    });

    it("should call both onSubmitError and onError when provided", () => {
        // Setup
        const onError = jest.fn();
        const onSubmitError = jest.fn();

        renderHook(() => {
            const formik = useFormik({
                initialValues: { name: "", email: "" },
                onSubmit: jest.fn(),
            });
            return withFormik(formik, { onError, onSubmitError });
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
