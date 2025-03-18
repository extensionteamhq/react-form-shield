import * as React from "react";
import { FormShieldProvider } from "react-form-shield";
import ContactForm from "./ContactForm";

/**
 * Example App demonstrating the FormShieldProvider
 *
 * This component shows how to use the FormShieldProvider to provide global
 * configuration for FormShield across multiple forms in an application.
 */
const App: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">
                FormShieldProvider Example
            </h1>

            {/* 
              FormShieldProvider wraps the application to provide global configuration
              for all forms that use FormShield.
            */}
            <FormShieldProvider
                settings={{
                    // Configure global settings for all forms
                    ENABLE_HONEYPOT: true,
                    ENABLE_TIME_DELAY: true,
                    ENABLE_CHALLENGE_DIALOG: true,
                    ENABLE_MULTIPLE_CHALLENGES: true,
                    CHALLENGE_TIME_VALUE: 5,
                    MAX_CHALLENGES: 3,
                }}
                // Global error handler for all forms
                onError={(error: unknown) => {
                    console.error("Global form shield error:", error);
                }}
                // Global honeypot field name (optional)
                honeypotFieldName="global_honeypot_field">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 
                      Multiple forms can use the same global configuration
                      provided by FormShieldProvider
                    */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">
                            Contact Form 1
                        </h2>
                        <p className="mb-4 text-gray-600">
                            This form uses the global FormShield configuration.
                        </p>
                        <ContactForm />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">
                            Contact Form 2
                        </h2>
                        <p className="mb-4 text-gray-600">
                            This form also uses the global FormShield
                            configuration. Each form can still override specific
                            settings if needed.
                        </p>
                        <ContactForm
                            overrideSettings={{
                                // Override specific settings for this form
                                ENABLE_MULTIPLE_CHALLENGES: false,
                            }}
                        />
                    </div>
                </div>
            </FormShieldProvider>
        </div>
    );
};

export default App;
