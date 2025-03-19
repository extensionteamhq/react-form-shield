# Custom Challenge Types Example

This example demonstrates how to create and use custom challenge types with React Form Shield.

## Overview

React Form Shield now supports custom challenge types, allowing you to create your own verification challenges beyond the built-in math and text challenges. This example shows how to create an image-based CAPTCHA challenge.

## Key Features

- **Custom Challenge Registry**: Register your own challenge types with unique identifiers
- **Custom Challenge Components**: Create React components to render your challenges
- **Challenge Type Selection**: Specify which challenge types to use in your forms
- **Extensible API**: Easy to integrate with existing form libraries

## How to Use Custom Challenge Types

### 1. Register a Custom Challenge Type

```jsx
import { challengeRegistry } from "react-form-shield";

// Register a custom challenge type
challengeRegistry.register("image-captcha", {
    // Function to generate a challenge
    generate: () => ({
        type: "image-captcha",
        question: "Enter the characters shown in the image",
        answer: "ABC123", // In a real implementation, this would be dynamic
        data: {
            imageUrl: "https://example.com/captcha.jpg",
        },
    }),

    // Optional custom validation function
    validate: (answer, challenge) => {
        // Custom validation logic
        return answer.trim().toUpperCase() === challenge.answer.toUpperCase();
    },

    // Optional custom component for rendering
    component: ImageCaptchaComponent,
});
```

### 2. Create a Custom Challenge Component

```jsx
const ImageCaptchaComponent = ({ challenge, answer, setAnswer, onSubmit }) => {
    return (
        <div>
            <label>{challenge.question}</label>
            <img
                src={challenge.data?.imageUrl}
                alt="CAPTCHA"
                className="mb-4 border rounded"
            />
            <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter characters"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && answer.trim()) {
                        e.preventDefault();
                        onSubmit();
                    }
                }}
            />
        </div>
    );
};
```

### 3. Use the Custom Challenge Type in Your Form

```jsx
const {
    honeypotProps,
    handleChallengeSubmit,
    showChallengeDialog,
    challenge,
    challengeAnswer,
    setChallengeAnswer,
    validateSubmission,
} = useFormShield({
    // Specify that you want to use your custom challenge type
    preferredChallengeType: "image-captcha",

    // Or specify multiple challenge types to randomly select from
    challengeTypes: ["math", "text", "image-captcha"],
});
```

## Running the Example

To run this example:

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm start`
4. Open your browser to the displayed URL

## Implementation Details

The custom challenge type system consists of:

1. **Challenge Registry**: A central registry for all challenge types
2. **Challenge Type Definition**: Interface defining how a challenge type works
3. **Challenge Component**: React component for rendering the challenge
4. **Challenge Data**: Structure containing the challenge information

See the `ImageCaptchaExample.tsx` file for a complete implementation example.
