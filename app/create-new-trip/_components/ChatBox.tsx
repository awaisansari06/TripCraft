"use client";

import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { Send, ArrowLeft, MoreVertical, Trash2, Bot, Sparkles, Wand2, Loader, ArrowDown } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useEffectEvent, useState, useRef } from 'react';
import UiRenderer, { type TripFormData } from './UiRenderer';
import EditTripDialog from './EditTripDialog';
import CreditDisplay, { type CreditInfo } from './CreditDisplay';
import { TripInfo } from './types';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTripDetail } from '@/app/provider';
import MessageContent, { formatAnswer } from './MessageContent';
import { useChatScroll } from './useChatScroll';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { tripSpecification } from '@/lib/trip-spec';

type Message = {
    role: string,
    content: string,
    timestamp?: string;
    ui?: string;
}

const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function ChatBox() {
    const searchParams = useSearchParams();
    const router = useRouter();
    // Get tripId from URL or generate one (but don't set in state yet to avoid mismatch)
    const tripIdParam = searchParams.get('tripId');
    const query = searchParams.get('query');

    const { userDetail } = useContext(UserDetailContext);

    // Convex Mutations
    const createTripDetail = useMutation(api.tripDetail.CreateTripDetail);
    const deleteTrip = useMutation(api.tripDetail.DeleteTrip);
    const saveMessage = useMutation(api.chat.SendMessage);

    // Convex Queries (enabled only if we have a tripId)
    // We use a ref or state to hold the 'active' tripId to separate from URL param
    const sessionId = tripIdParam;

    useEffect(() => {
        if (!tripIdParam) {
            // Generate new Trip ID if none exists
            const newTripId = uuidv4();
            // Update URL without reloading
            const newUrl = `/create-new-trip?tripId=${newTripId}` + (query ? '&query=' + encodeURIComponent(query) : '');
            router.replace(newUrl);
        }
    }, [tripIdParam, query, router]);

    // Load data from DB
    const dbMessages = useQuery(api.chat.GetMessages, sessionId && userDetail ? { tripId: sessionId } : "skip");
    const dbTrip = useQuery(api.tripDetail.GetTrip, sessionId && userDetail ? { tripId: sessionId } : "skip");

    const [messages, setMessages] = useState<Message[]>(() => {
        if (dbMessages?.length) return dbMessages as Message[];
        if (dbTrip?.tripDetail && dbMessages?.length === 0) return [{
            role: 'assistant',
            content: 'Here is the plan for your trip to ' + (dbTrip.tripDetail.locationInfo?.name || 'your destination'),
            ui: 'tripResult', timestamp: getCurrentTime(),
        }];
        return [];
    });
    const [userInput, setUserInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [tripData, setTripData] = useState<TripFormData>(() => dbTrip?.tripDetail ?? {});
    const { setTripDetailInfo } = useTripDetail();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isFinal, setIsFinal] = useState(false);
    const [failedGeneration, setFailedGeneration] = useState(false);
    const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [actionError, setActionError] = useState('');

    const { containerRef: messagesContainerRef, contentRef: conversationRef, followLatest, showLatest, scrollToLatest } = useChatScroll();
    const initialized = useRef(false);
    const [queryInitialized, setQueryInitialized] = useState(false);
    const pendingRequest = useRef<{ text: string; id: string } | null>(null);
    const sending = useRef(false);

    // Reconcile a new database snapshot before committing the render. This avoids
    // an effect showing a stale conversation for a frame after data arrives.
    const [previousMessages, setPreviousMessages] = useState(dbMessages);
    if (dbMessages !== previousMessages) {
        setPreviousMessages(dbMessages);
        if (dbMessages && !queryInitialized) {
            setMessages(dbMessages as Message[]);
        }
    }

    // Sync Trip Data from DB
    const [previousTrip, setPreviousTrip] = useState(dbTrip);
    const [previousLegacyMessages, setPreviousLegacyMessages] = useState(dbMessages);
    if (dbTrip !== previousTrip || dbMessages !== previousLegacyMessages) {
        setPreviousTrip(dbTrip);
        setPreviousLegacyMessages(dbMessages);
        if (dbTrip && dbTrip.tripDetail) {
            setTripData(previous => ({ ...previous, ...dbTrip.tripDetail }));

            // Fix for Legacy Trips: If we have trip data but NO messages in DB
            if (dbMessages !== undefined && dbMessages.length === 0) {
                const legacyMsg: Message = {
                    role: "assistant",
                    content: "Here is the plan for your trip to " + (dbTrip.tripDetail?.locationInfo?.name || "your destination"),
                    ui: "tripResult",
                    timestamp: getCurrentTime()
                };
                setMessages([legacyMsg]);
            }
        }
    }

    const onSend = useCallback(async (msg?: string, final = false) => {
        const textToUse = msg || userInput;
        if (!textToUse?.trim() || sending.current || !sessionId || !userDetail || deleting) return;
        sending.current = true;
        followLatest();

        setUserInput('');
        setLoading(true);

        // Capture data based on previous question context
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant' && lastMsg.ui) {
                if (lastMsg.ui === 'source') {
                    setTripData((prev) => ({ ...prev, source: textToUse }));
                } else if (lastMsg.ui === 'destination') {
                    setTripData((prev) => ({ ...prev, destination: textToUse }));
                } else if (lastMsg.ui === 'groupSize') {
                    setTripData((prev) => ({ ...prev, groupSize: textToUse }));
                } else if (lastMsg.ui === 'budget') {
                    setTripData((prev) => ({ ...prev, budget: textToUse }));
                } else if (lastMsg.ui === 'tripDuration') {
                    setTripData((prev) => ({ ...prev, tripDuration: textToUse }));
                } else if (lastMsg.ui === 'interests') {
                    setTripData((prev) => ({ ...prev, interests: textToUse }));
                } else if (lastMsg.ui === 'tripStyle') {
                    setTripData((prev) => ({ ...prev, tripStyle: textToUse }));
                } else if (lastMsg.ui === 'travelPace') {
                    setTripData((prev) => ({ ...prev, travelPace: textToUse }));
                }
            }
        }

        const newMessage: Message = {
            role: "user",
            content: textToUse,
            timestamp: getCurrentTime()
        };

        setMessages((prev) => [...prev, newMessage]);

        try {
        if (sessionId) {
            await saveMessage({
                tripId: sessionId,
                role: "user",
                content: textToUse,
                timestamp: newMessage.timestamp
            });
        }

            const tripSpec = final ? tripSpecification(tripData) : undefined;
            const requestKey = JSON.stringify({ text: textToUse, isFinal: final, tripSpec });
            if (pendingRequest.current?.text !== requestKey) {
                pendingRequest.current = { text: requestKey, id: crypto.randomUUID() };
            }
            const result = await axios.post("/api/aimodel", {
                messages: [...messages, { role: "user", content: textToUse }],
                isFinal: final,
                tripSpec,
                requestId: pendingRequest.current.id
            });
            if (result.data.credits) setCreditInfo(result.data.credits);

            if (final && result.data.trip_plan) {
                // Handle Final Trip Plan
                const tripPlan = result.data.trip_plan as TripInfo;

                // Save to state
                setTripDetailInfo(tripPlan);

                // Save to DB (Convex)
                if (userDetail && userDetail._id) {
                    const tripId = sessionId;
                    try {
                        await createTripDetail({
                            tripId: tripId,
                            uid: userDetail._id,
                            tripDetail: tripPlan
                        });

                        const successMsg = "Your trip is generated.";
                        setMessages((prev) => [...prev, {
                            role: "assistant",
                            content: successMsg,
                            timestamp: getCurrentTime()
                        }]);

                        if (sessionId) {
                            await saveMessage({
                                tripId: sessionId,
                                role: "assistant",
                                content: successMsg,
                                timestamp: getCurrentTime()
                            });
                        }

                        // Refresh credit display
                    } catch (dbError) {
                        console.error("Failed to save trip to Convex:", dbError);
                        throw new Error("Your plan was generated but could not be saved. Retry generation to save it without using another credit.");
                    }
                } else {
                    // Not logged in handling...
                    const msgContent = "I've generated your complete travel plan! Please login to save this trip.";
                    setMessages((prev) => [...prev, {
                        role: "assistant",
                        content: msgContent,
                        ui: "tripResult",
                        timestamp: getCurrentTime()
                    }]);
                    // Don't save this message as we don't have a user session? 
                    // Actually we have sessionId (tripId). We can save it.
                    if (sessionId) {
                        await saveMessage({
                            tripId: sessionId,
                            role: "assistant",
                            content: msgContent,
                            ui: "tripResult",
                            timestamp: getCurrentTime()
                        });
                    }
                }

                setTripData(previous => ({ ...previous, ...tripPlan }));
                setIsFinal(false);
            } else if (result.data.ui === "limit") {
                const limitMsg = "🎯 You've used your 2 free trips! Upgrade to premium for unlimited trip planning. Visit our pricing page to continue.";
                setMessages((prev) => [...prev, {
                    role: "assistant",
                    content: limitMsg,
                    timestamp: getCurrentTime()
                }]);

                if (sessionId) {
                    await saveMessage({
                        tripId: sessionId,
                        role: "assistant",
                        content: limitMsg,
                        timestamp: getCurrentTime()
                    });
                }
                setIsFinal(false);
            } else {
                // Handle Normal Response
                const aiContent = result.data.resp;
                const aiUi = result.data.ui;

                setMessages((prev) => [...prev, {
                    role: "assistant",
                    content: aiContent,
                    ui: aiUi,
                    timestamp: getCurrentTime()
                }]);

                if (sessionId) {
                    await saveMessage({
                        tripId: sessionId,
                        role: "assistant",
                        content: aiContent,
                        ui: aiUi,
                        timestamp: getCurrentTime()
                    });
                }
            }

            pendingRequest.current = null;

        } catch (error) {
            console.error(error);
            if (final) setFailedGeneration(true);

            // Enhanced error handling with specific messages
            let errorMessage = error instanceof Error && error.message.startsWith('Your plan was generated') ? error.message : "Something went wrong. Please try again.";

            if (axios.isAxiosError(error)) {
                // Check for credit limit error
                if (error.response?.data?.resp === "No Free Credit Remaining") {
                    errorMessage = "🎯 You've used your 2 free trips! Upgrade to premium for unlimited trip planning.";
                }
                // Check for network errors
                else if (error.response?.data?.error) {
                    const apiError = error.response.data.error;
                    if (apiError.includes("Network connection issue") || apiError.includes("fetch failed")) {
                        errorMessage = "⚠️ Network connection issue detected. The AI service is temporarily unavailable. Please check your internet connection and try again in a moment.";
                    } else if (apiError.includes("API key")) {
                        errorMessage = "⚠️ Configuration error. Please contact support.";
                    } else {
                        errorMessage = `⚠️ ${apiError}`;
                    }
                }
                // Network timeout or connection refused
                else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
                    errorMessage = "⚠️ Connection timeout. Please check your internet connection and try again.";
                }
                // Server error (500)
                else if (error.response?.status === 500) {
                    errorMessage = "⚠️ Server error occurred. Our team has been notified. Please try again in a moment.";
                }
            }

            setMessages((prev) => [...prev, {
                role: "assistant",
                content: errorMessage,
                timestamp: getCurrentTime()
            }]);

            if (sessionId) {
                await saveMessage({
                    tripId: sessionId,
                    role: "assistant",
                    content: errorMessage,
                    timestamp: getCurrentTime()
                });
            }
        } finally {
            sending.current = false;
            setLoading(false);
            setIsFinal(false);
        }
    }, [userInput, sessionId, userDetail, deleting, messages, tripData, saveMessage, createTripDetail, setTripDetailInfo, followLatest]);

    useEffect(() => {
        setTripDetailInfo(dbTrip?.tripDetail ?? null);
    }, [dbTrip, setTripDetailInfo]);

    // The URL/database readiness drives this event; edits to the composer must
    // not replay the landing prompt. The event reads the latest send callback.
    const sendLandingPrompt = useEffectEvent(() => {
        if (query && sessionId && userDetail && dbMessages !== undefined && !initialized.current) {
            initialized.current = true;
            setQueryInitialized(true);
            if (dbMessages.length === 0) void onSend(query);
            router.replace('/create-new-trip?tripId=' + sessionId);
        }
    });

    useEffect(() => {
        // Allow the ready conversation to paint before starting the automatic
        // landing request; cancel it if navigation/readiness changes first.
        const timer = window.setTimeout(sendLandingPrompt, 0);
        return () => window.clearTimeout(timer);
    }, [query, sessionId, userDetail, dbMessages]);

    const handleUiSelect = (value: unknown) => {
        // Automatically send the selected value as a message
        if (!loading) onSend(String(value));
    }

    const handleGenerateTrip = async () => {
        if (loading || sending.current) return;
        setFailedGeneration(false);
        setIsFinal(true);
        void onSend("Generate my full travel plan now", true);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (!loading) onSend();
        }
    };

    const handleDeleteTrip = async () => {
        if (!sessionId || loading || deleting || !confirm("Delete this trip and its conversation? This cannot be undone.")) return;
        setDeleting(true);
        setActionError('');
        try {
            await deleteTrip({ tripId: sessionId });
            setTripDetailInfo(null);
            router.push('/dashboard');
        } catch {
            setActionError('The trip could not be deleted. Please try again.');
            setDeleting(false);
        }
    }

    return (
        <div className="planner-assistant">
            <header className="chat-header">
                <span className="chat-avatar" aria-hidden="true"><Bot size={21} /></span>
                <div className="chat-header-copy">
                    <h1>TripCraft Assistant</h1>
                    <p>Your ideas. A thoughtfully planned trip.</p>
                </div>
                <div className="chat-header-actions">
                    <button type="button" className="planner-icon-button" disabled={loading} onClick={() => setMessages([])} aria-label="Clear conversation" title="Clear conversation"><Wand2 size={17} /></button>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button type="button" className="planner-icon-button" aria-label="Conversation options"><MoreVertical size={18} /></button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content className="planner-menu" sideOffset={6} align="end">
                                <DropdownMenu.Item onSelect={() => router.push('/dashboard')}><ArrowLeft size={16} />My trips</DropdownMenu.Item>
                                <DropdownMenu.Item disabled={loading || deleting} onSelect={() => void handleDeleteTrip()} className="planner-menu-danger"><Trash2 size={16} />{deleting ? 'Deleting…' : 'Delete trip'}</DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </header>

            <div className="chat-history-region">
                <div ref={messagesContainerRef} className="chat-history" role="region" aria-label="Trip conversation" tabIndex={0}>
                    <div ref={conversationRef} className="chat-conversation">
                        {messages.length === 0 && !loading && <div className="chat-empty">
                            <span className="chat-empty-icon" aria-hidden="true"><Sparkles size={25} /></span>
                            <h2>{tripData?.locationInfo ? 'Your next chapter awaits' : 'Where would you love to go?'}</h2>
                            <p>{tripData?.locationInfo
                                ? 'Continue planning your trip to ' + String(tripData.locationInfo.name || 'your destination') + '.'
                                : 'Share a destination, a dream, or just an idea. We’ll work out the details together.'}</p>
                            {tripData?.locationInfo && <button type="button" className="planner-button-secondary" onClick={() => onSend('Continue planning this trip')}>Continue planning</button>}
                        </div>}
                        {messages.map((msg, index) => {
                            const isUser = msg.role === 'user';
                            const previousQuestion = index > 0 ? messages[index - 1]?.ui : undefined;
                            const answer = messages[index + 1]?.role === 'user' ? messages[index + 1].content : undefined;
                            const hasWidget = ['groupSize', 'budget', 'tripDuration', 'interests', 'tripStyle', 'travelPace', 'final', 'tripResult'].includes(msg.ui || '');
                            const completed = !isUser && hasWidget && !!answer && msg.ui !== 'tripResult' && !(msg.ui === 'final' && loading && isFinal);
                            const widget = !isUser && hasWidget ? <UiRenderer
                                uiType={msg.ui!} onSelect={handleUiSelect} tripData={tripData}
                                onGenerate={handleGenerateTrip} onEdit={() => setIsEditOpen(true)}
                                loading={loading && !completed} disabled={messages.length - 1 !== index || loading}
                            /> : null;
                            return <article key={index} className={'chat-message ' + (isUser ? 'chat-message-user' : 'chat-message-assistant')} aria-label={isUser ? 'You' : 'TripCraft'}>
                                <div className="chat-bubble">
                                    <MessageContent content={msg.content} answerType={isUser ? previousQuestion : undefined} />
                                </div>
                                {!completed && widget && <div className="chat-widget">{widget}</div>}
                                {completed && <details className="chat-completed-question">
                                    <summary><span>Previous question</span><span>{msg.ui === 'final' ? 'Trip confirmed' : formatAnswer(answer!, msg.ui)}</span></summary>
                                    <div className="chat-widget">{widget}</div>
                                </details>}
                                {msg.timestamp && <time className="chat-timestamp">{msg.timestamp}</time>}
                                {failedGeneration && index === messages.length - 1 && !loading && <button type="button" className="planner-button-secondary" onClick={handleGenerateTrip}>Retry generation</button>}
                            </article>;
                        })}
                        {loading && <div className="chat-loading" role="status">
                            <div className="chat-typing-dots" aria-hidden="true"><i /><i /><i /></div>
                            <span>{isFinal ? 'Putting your itinerary together…' : 'TripCraft is thinking…'}</span>
                        </div>}
                    </div>
                </div>
                {showLatest && <button type="button" className="chat-jump-latest" onClick={scrollToLatest}><ArrowDown size={14} />Latest messages</button>}
            </div>

            <footer className="chat-footer">
                {actionError && <p role="alert">{actionError}</p>}
                <CreditDisplay latest={creditInfo} />
                <form className="chat-composer" aria-busy={loading} onSubmit={event => { event.preventDefault(); if (!loading) onSend(); }}>
                    <label htmlFor="chat-message" className="sr-only">Your message</label>
                    <Textarea id="chat-message" name="message" rows={2} placeholder="Tell us about your trip…"
                        className="chat-composer-input" onChange={event => setUserInput(event.target.value)}
                        onKeyDown={handleKeyDown} value={userInput} aria-describedby="chat-keyboard-hint" />
                    <button type="submit" className="chat-send" disabled={!userInput.trim() || loading || deleting || !userDetail} aria-label={loading ? 'Waiting for TripCraft' : 'Send message'}>
                        {loading ? <Loader size={18} className="planner-spinner" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                    </button>
                </form>
                <p id="chat-keyboard-hint" className="chat-keyboard-hint">Enter to send <span aria-hidden="true">·</span> Shift + Enter for a new line</p>
            </footer>
            <EditTripDialog key={isEditOpen ? 'editing-' + JSON.stringify(tripData) : 'closed'}
                open={isEditOpen} onClose={() => setIsEditOpen(false)} currentData={tripData}
                onSave={newData => setTripData(newData)} />
        </div>
    );
}

export default ChatBox;
