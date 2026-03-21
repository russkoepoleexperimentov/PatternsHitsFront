import { Transaction } from '@/domain/models/account';
import { useAuth } from '@/ui/context/AuthContext';
import { useEffect, useRef } from 'react';

export const useTransactionsWebSocket = (
    onOpen?: () => void,
    onMessage?: (transaction: Transaction) => void,
    onError?: (error: Event) => void
) => {
    const url = `ws://localhost:2281/wstransactions`;
    const { user } = useAuth();

    const onOpenRef = useRef(onOpen);
    const onMessageRef = useRef(onMessage);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onOpenRef.current = onOpen;
        onMessageRef.current = onMessage;
        onErrorRef.current = onError;
    }, [onOpen, onMessage, onError]);

    useEffect(() => {
        const ws = new WebSocket(`${url}?token=${user?.access_token}`);

        ws.onopen = () => {
            console.log('WebSocket connected');
            onOpenRef.current?.();
        };

        ws.onmessage = (event) => {
            try {
                const transaction: Transaction = JSON.parse(event.data);
                console.log('Message received:', transaction);
                onMessageRef.current?.(transaction);
            } catch (error) {
                console.error('Failed to parse transaction:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            onErrorRef.current?.(error);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [url, user?.access_token]);
};