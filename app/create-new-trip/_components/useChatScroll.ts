"use client";
import { useCallback, useEffect, useRef, useState } from 'react';

/** Follow new content only while the reader is near the end of this scroller. */
export function useChatScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const following = useRef(true);
    const followLatest = useCallback(() => { following.current = true; }, []);
    const [showLatest, setShowLatest] = useState(false);
    const scrollToLatest = useCallback(() => {
        following.current = true;
        setShowLatest(false);
        const container = containerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
    }, []);
    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;
        let frame = 0;
        let readingPosition = container.scrollTop;
        const update = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                if (!container.clientHeight) return;
                container.scrollTop = following.current ? container.scrollHeight : readingPosition;
            });
        };
        const onScroll = () => {
            if (!container.clientHeight) return;
            readingPosition = container.scrollTop;
            const nearEnd = container.scrollHeight - container.scrollTop - container.clientHeight < 96;
            following.current = nearEnd;
            setShowLatest(previous => previous === !nearEnd ? previous : !nearEnd);
        };
        container.addEventListener('scroll', onScroll, { passive: true });
        const observer = new ResizeObserver(update);
        observer.observe(content);
        observer.observe(container);
        update();
        return () => { observer.disconnect(); cancelAnimationFrame(frame); container.removeEventListener('scroll', onScroll); };
    }, []);
    return { containerRef, contentRef, followLatest, showLatest, scrollToLatest };
}
