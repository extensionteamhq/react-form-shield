# Getting Started with react-form-shield

This guide will walk you through the process of integrating react-form-shield into your React application.

## Prerequisites

- React 16.8.0 or higher (for hooks support)
- A React project set up with a form

## Installation

Install react-form-shield using npm, yarn, or pnpm:

```bash
# npm
npm install react-form-shield

# yarn
yarn add react-form-shield

# pnpm
pnpm add react-form-shield
```

## Basic Usage

### 1. Import the necessary components and hooks

```jsx
import {
    useFormShield,
    HoneypotField,
    ChallengeDialog,
} from "react-form-shield";
```

### 2. Add react-form-shield to your form component

```jsx
function ContactForm() {
    // Your existing form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    // Initialize form shield
    const {
        honeypotProps,
        showChallengeDialog,
        setShowChallengeDialog,
        challenge,
        challengeAnswer,
        setChallengeAnswer,
        handleChallengeSubmit,
        validateSubmission,
        getFormShieldData,
        handleFieldFocus,
    } = useFormShield();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate submission with form shield
        const validationResult = validateSubmission(formData);

        if (validationResult.passed) {
            // Submit form with anti-spam data
            await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    ...getFormShieldData(),
                }),
            });

            // Handle success
            alert("Form submitted successfully!");
        }
        // If validation fails, the challenge dialog will be shown automatically
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                {/* Regular form fields */}
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        onFocus={() => handleFieldFocus()}
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        onFocus={() => handleFieldFocus()}
                    />
                </div>

                <div>
                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                message: e.target.value,
                            })
                        }
                        onFocus={() => handleFieldFocus()}
                    />
                </div>

                {/* Honeypot field (invisible to humans) */}
                <HoneypotField {...honeypotProps} />

                <button type="submit">Submit</button>
            </form>

            {/* Challenge dialog */}
            <ChallengeDialog
                open={showChallengeDialog}
                onOpenChange={setShowChallengeDialog}
                challenge={challenge}
                challengeAnswer={challengeAnswer}
                setChallengeAnswer={setChallengeAnswer}
                onSubmit={() => handleChallengeSubmit(handleSubmit)}
            />
        </>
    );
}
```

## Server-Side Integration

To complete the protection, you need to add server-side validation. Here's how to do it with Express.js:

```javascript
const express = require("express");
const { formShieldMiddleware } = require("react-form-shield/server");

const app = express();
app.use(express.json());

app.post("/api/contact", formShieldMiddleware(), (req, res) => {
    // Form data is validated by middleware
    // Process the form submission
    console.log("Form data:", req.body);
    res.json({ success: true });
});

app.listen(3000);
```

For Next.js API routes:

```javascript
import { withFormShield } from "react-form-shield/server";

const handler = async (req, res) => {
    // Form data is validated by withFormShield
    // Process the form submission
    console.log("Form data:", req.body);
    res.status(200).json({ success: true });
};

export default withFormShield({}, handler);
```

## Next Steps

Now that you have the basic integration working, you can:

1. Customize the anti-spam settings
2. Style the challenge dialog to match your application
3. Integrate with form libraries like React Hook Form or Formik
4. Use the FormShieldProvider for global configuration across multiple forms

Check out the [Advanced Usage Guide](./advanced-usage.md) for more details on these topics, including how to use the FormShieldProvider to provide global configuration for all forms in your application.
