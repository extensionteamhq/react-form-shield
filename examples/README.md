# react-form-shield Examples

This directory contains example implementations of react-form-shield in different environments.

## Examples

### React Hook Form

The `react-hook-form` directory contains an example of using react-form-shield with [React Hook Form](https://react-hook-form.com/), a popular form library for React.

To run this example:

```bash
cd react-hook-form
npm install
npm run dev
```

### Express.js

The `express` directory contains an example of using react-form-shield with [Express.js](https://expressjs.com/), a popular web framework for Node.js.

To run this example:

```bash
cd express
npm install
npm start
```

### Next.js

The `next-js` directory contains an example of using react-form-shield with [Next.js](https://nextjs.org/), a React framework for production.

To run this example:

```bash
cd next-js
npm install
npm run dev
```

## How to Use

Each example demonstrates a different aspect of react-form-shield:

1. **React Hook Form**: Shows how to integrate the client-side components and hooks with React Hook Form.
2. **Express.js**: Shows how to use the server-side middleware with Express.js.
3. **Next.js**: Shows how to use the server-side HOC with Next.js API routes.

Feel free to explore these examples to understand how to use react-form-shield in your own projects.

## Creating Your Own Implementation

To create your own implementation:

1. Install react-form-shield:

```bash
npm install react-form-shield
```

2. Import the necessary components and hooks:

```jsx
import {
    useFormShield,
    ChallengeDialog,
    HoneypotField,
} from "react-form-shield";
```

3. Use the `useFormShield` hook in your form component:

```jsx
const {
    honeypotProps,
    showChallengeDialog,
    challenge,
    challengeAnswer,
    setChallengeAnswer,
    handleChallengeSubmit,
    validateSubmission,
    getFormShieldData,
} = useFormShield();
```

4. Add the `HoneypotField` and `ChallengeDialog` components to your form:

```jsx
<form onSubmit={handleSubmit}>
    {/* Regular form fields */}
    <HoneypotField {...honeypotProps} />
    <button type="submit">Submit</button>

    <ChallengeDialog
        open={showChallengeDialog}
        onOpenChange={setShowChallengeDialog}
        challenge={challenge}
        challengeAnswer={challengeAnswer}
        setChallengeAnswer={setChallengeAnswer}
        onSubmit={() => handleChallengeSubmit(submitForm)}
    />
</form>
```

5. On the server side, use the appropriate middleware or HOC:

```js
// Express.js
const { formShieldMiddleware } = require("react-form-shield/server");
app.post("/api/contact", formShieldMiddleware(), handleContact);

// Next.js
import { withFormShield } from "react-form-shield/server";
export default withFormShield({}, handleContact);
```

For more detailed information, refer to the [API documentation](../docs/api/index.md).
