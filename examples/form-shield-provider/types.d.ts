declare module 'react-form-shield' {
    export interface AntiSpamSettings {
        ENABLE_TIME_DELAY: boolean;
        ENABLE_CHALLENGE_DIALOG: boolean;
        ENABLE_HONEYPOT: boolean;
        ENABLE_MULTIPLE_CHALLENGES: boolean;
        CHALLENGE_TIME_VALUE: number;
        MAX_CHALLENGES: number;
    }

    export const FormShieldProvider: React.FC<{
        children: React.ReactNode;
        settings?: Partial<AntiSpamSettings>;
        onError?: (error: unknown) => void;
        honeypotFieldName?: string;
    }>;

    export const HoneypotField: React.FC<any>;
    export const ChallengeDialog: React.FC<any>;
    export function withReactHookForm(form: any, options?: any): any;
}

declare module '@hookform/resolvers/zod' {
    export const zodResolver: any;
}

declare module 'zod' {
    export const z: {
        object: (schema: any) => any;
        string: () => {
            min: (length: number, message: { message: string }) => any;
            email: (message: { message: string }) => any;
        };
    };
    export type infer<T> = any;
}

declare module 'react-hook-form' {
    export function useForm<T = any>(options?: any): any;
}
