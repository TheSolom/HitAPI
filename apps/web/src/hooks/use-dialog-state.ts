import { useCallback, useState } from 'react';

/**
 * Merges controlled (external) and uncontrolled (internal) open state for
 * dialogs and popovers.
 *
 * - If `externalOpen` is provided, the component is fully controlled.
 * - Otherwise, internal state is used.
 *
 * @param externalOpen         - Controlled open value (optional).
 * @param externalOnOpenChange - Controlled setter (optional).
 */
export function useDialogState(
    externalOpen?: boolean,
    externalOnOpenChange?: (open: boolean) => void,
): {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
} {
    const [internalOpen, setInternalOpen] = useState(false);

    const isOpen = externalOpen ?? internalOpen;

    const setIsOpen = useCallback(
        (open: boolean) => {
            if (externalOnOpenChange) {
                externalOnOpenChange(open);
            } else {
                setInternalOpen(open);
            }
        },
        [externalOnOpenChange],
    );

    return { isOpen, setIsOpen };
}
