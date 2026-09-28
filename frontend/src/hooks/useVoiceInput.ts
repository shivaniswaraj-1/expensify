import { useCallback, useRef, useState } from "react";

export type VoiceLang = "hi-IN" | "en-IN";

type VoiceState = "idle" | "listening" | "error";

// Thin wrapper around the browser's Web Speech API (SpeechRecognition). Only
// Chrome ships it reliably, so callers should check `isSupported` and show a
// fallback message in other browsers.
export const useVoiceInput = (lang: VoiceLang) => {
    const [state, setState] = useState<VoiceState>("idle");
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const SpeechRecognitionCtor =
        typeof window !== "undefined" ? window.SpeechRecognition ?? window.webkitSpeechRecognition : undefined;
    const isSupported = !!SpeechRecognitionCtor;

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    const start = useCallback(
        (onResult: (transcript: string) => void, onError: (message: string) => void) => {
            if (!SpeechRecognitionCtor) {
                onError("Voice input isn't supported in this browser. Please use Chrome.");
                return;
            }

            const recognition = new SpeechRecognitionCtor();
            recognition.lang = lang;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
                if (transcript) {
                    onResult(transcript);
                } else {
                    onError("Didn't catch that. Please try again.");
                }
            };
            recognition.onerror = (event) => {
                setState("error");
                onError(
                    event.error === "no-speech"
                        ? "Didn't catch that. Please try again."
                        : event.error === "not-allowed"
                        ? "Microphone access was denied."
                        : "Voice input failed. Please try again."
                );
            };
            recognition.onend = () => setState((s) => (s === "listening" ? "idle" : s));

            recognitionRef.current = recognition;
            setState("listening");
            recognition.start();
        },
        [SpeechRecognitionCtor, lang]
    );

    return { isSupported, isListening: state === "listening", start, stop };
};
