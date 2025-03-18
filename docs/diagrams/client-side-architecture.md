# Client-Side Architecture

This diagram illustrates the architecture of react-form-shield's client-side components.

```mermaid
flowchart TD
    FormShieldProvider[FormShieldProvider] --> Config[Configuration]
    FormShieldProvider --> Hooks[Hooks]

    Hooks --> useFormShield[useFormShield]
    Hooks --> useHoneypot[useHoneypot]
    Hooks --> useTimeDelay[useTimeDelay]
    Hooks --> useChallenge[useChallenge]

    useFormShield --> Components[Components]
    Components --> ChallengeDialog[ChallengeDialog]
    Components --> HoneypotField[HoneypotField]

    Adapters[Framework Adapters] --> RHFAdapter[React Hook Form]
    Adapters --> FormikAdapter[Formik]
    Adapters --> NativeAdapter[Native React]

    useFormShield --> Validators[Client Validators]
    Validators --> HoneypotValidator[Honeypot Validation]
    Validators --> TimeValidator[Time Delay Validation]
    Validators --> ChallengeValidator[Challenge Validation]
```

## Components

- **FormShieldProvider**: Context provider for global configuration
- **Hooks**: React hooks for form protection
    - **useFormShield**: Main hook for form protection
    - **useHoneypot**: Hook for honeypot field management
    - **useTimeDelay**: Hook for time delay verification
    - **useChallenge**: Hook for challenge generation and validation
- **Components**: UI components
    - **ChallengeDialog**: Dialog for human verification challenges
    - **HoneypotField**: Hidden field for bot detection
- **Adapters**: Framework adapters
    - **React Hook Form**: Adapter for React Hook Form
    - **Formik**: Adapter for Formik
    - **Native React**: Adapter for native React forms
- **Validators**: Client-side validators
    - **Honeypot Validation**: Validates honeypot fields
    - **Time Delay Validation**: Validates time delay
    - **Challenge Validation**: Validates challenge completion
