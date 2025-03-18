# FormShieldProvider Example

This example demonstrates how to use the `FormShieldProvider` component to provide global configuration for FormShield across multiple forms in an application.

## Overview

The `FormShieldProvider` component allows you to set global configuration options for all FormShield instances in your application. This is useful when you have multiple forms that should share the same anti-spam settings.

## Features

- Global configuration for all FormShield instances
- Per-form override of specific settings
- Centralized error handling
- Consistent honeypot field names

## How It Works

1. Wrap your application (or a section of it) with the `FormShieldProvider` component
2. Configure global settings through the `settings` prop
3. Provide a global error handler through the `onError` prop
4. Optionally provide a global honeypot field name through the `honeypotFieldName` prop
5. Individual forms can still override specific settings if needed

## Example Structure

- `App.tsx`: Demonstrates how to use the `FormShieldProvider` component
- `ContactForm.tsx`: A form component that uses the global configuration from the `FormShieldProvider`

## Code Example

```tsx
// App.tsx
import React from "react";
import { FormShieldProvider } from "react-form-shield";
import ContactForm from "./ContactForm";

const App: React.FC = () => {
    return (
        <FormShieldProvider
            settings={{
                ENABLE_HONEYPOT: true,
                ENABLE_TIME_DELAY: true,
                ENABLE_CHALLENGE_DIALOG: true,
                ENABLE_MULTIPLE_CHALLENGES: true,
            }}
            onError={(error) => {
                console.error("Global form shield error:", error);
            }}
            honeypotFieldName="global_honeypot_field">
            {/* Multiple forms can use the same global configuration */}
            <ContactForm />

            {/* Forms can override specific settings if needed */}
            <ContactForm
                overrideSettings={{
                    ENABLE_MULTIPLE_CHALLENGES: false,
                }}
            />
        </FormShieldProvider>
    );
};
```

```tsx
// ContactForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { withReactHookForm, AntiSpamSettings } from "react-form-shield";

interface ContactFormProps {
    overrideSettings?: Partial<AntiSpamSettings>;
}

const ContactForm: React.FC<ContactFormProps> = ({ overrideSettings }) => {
    const form = useForm();

    // The withReactHookForm adapter will use the global configuration from FormShieldProvider
    // but we can also override specific settings if needed
    const {
        register,
        handleSubmit,
        honeypotProps,
        // ...other props
    } = withReactHookForm(form, {
        // Override settings from FormShieldProvider if provided
        settings: overrideSettings,
    });

    // Rest of the form implementation
};
```

## Running the Example

1. Install dependencies:

    ```
    npm install
    ```

2. Start the development server:

    ```
    npm start
    ```

3. Open your browser to the local development server (usually http://localhost:3000)

## Key Points

- The `FormShieldProvider` component uses React Context to provide global configuration
- The `useFormShield` hook and framework adapters automatically use this global configuration
- Individual forms can still override specific settings if needed
- This approach reduces duplication and ensures consistent anti-spam protection across your application
