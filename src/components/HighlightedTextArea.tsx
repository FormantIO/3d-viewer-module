import React, { useRef, useEffect } from "react";
import styled from "styled-components";

interface IHighlightedTextarea {
    value: string;
    onChange: (value: string) => void;
    highlight?: string;
    isValidJSON: boolean;
}

interface IHighlightedTextareaProps {
    isValidJSON: boolean;
}

const HighlightedTextareaContainer = styled.div<IHighlightedTextareaProps>`
    height: 100%;
    textarea {
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 5px;
        padding: 5px;
        font-family: monospace;
        white-space: nowrap;
        tab-size: 1;

        &:focus-visible {
            outline: ${props => props.isValidJSON ? '2px solid #00ff00aa' : '2px solid #ff0000aa'};
        }
    }
`;

const HighlightedTextarea = ({ value, onChange, highlight, isValidJSON }: IHighlightedTextarea) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;

        if (textarea) {
            const scrollHeight = textarea.scrollHeight;
            const offsetHeight = textarea.offsetHeight;
            const scrollTop = textarea.scrollTop;

            if (scrollHeight > offsetHeight && scrollTop < scrollHeight - offsetHeight) {
                textarea.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
            }
        }
    }, [highlight]);

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event.target.value);
    };

    function escapeRegExp(string: string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
    }
    const regex = new RegExp(`\\s*${escapeRegExp(highlight || '')}\\s*`, "gi");

    const highlightedValue = highlight
        ? value.replace(regex, "<mark>$1</mark>")
        : value;


    return (
        <HighlightedTextareaContainer isValidJSON={isValidJSON}>
            <textarea
                ref={textareaRef}
                value={highlightedValue}
                onChange={handleInputChange}

            />
        </HighlightedTextareaContainer>
    );
};

export default HighlightedTextarea;