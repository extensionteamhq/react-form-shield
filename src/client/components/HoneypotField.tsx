/**
 * HoneypotField Component
 *
 * This component renders a hidden input field that is invisible to humans
 * but typically filled out by bots. It's used for bot detection.
 *
 * @module client/components/HoneypotField
 */

import React from "react";
import { HoneypotFieldProps } from "../types";
import { getHoneypotStyles } from "../utils";

/**
 * HoneypotField component for bot detection
 * @component
 * @param {HoneypotFieldProps} props - Component props
 * @returns {JSX.Element} Rendered honeypot field
 */
export const HoneypotField: React.FC<HoneypotFieldProps> = ({
    name,
    style,
}) => {
    // Combine default honeypot styles with any additional styles
    const combinedStyles = {
        ...getHoneypotStyles(),
        ...style,
    };

    return (
        <div style={combinedStyles} aria-hidden="true">
            <label htmlFor={name} style={combinedStyles}>
                Please leave this field empty
            </label>
            <input
                type="text"
                id={name}
                name={name}
                tabIndex={-1}
                autoComplete="off"
                style={combinedStyles}
            />
        </div>
    );
};
