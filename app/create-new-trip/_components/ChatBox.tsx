"use client";

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { Send, ArrowLeft, MoreVertical, Trash2, Bot, Sparkles, Wand2, Loader } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
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

type Message = {
    role: string,
    content: string,
    timestamp?: string;
    ui?: string;
}

function ChatBox() {
    const searchParams = useSearchParams();
    const router = useRouter();
    // Get tripId from URL or generate one (but don't set in state yet to avoid mismatch)
    const tripIdParam = searchParams.get('tripId');
    const query = searchParams.get('query');

    const { userDetail } = useContext(UserDetailContext);

    // Convex Mutations
    const createTripDetail = useMutation(api.tripDetail.CreateTripDetail);
    const saveMessage = useMutation(api.chat.SendMessage);

    // Convex Queries (enabled only if we have a tripId)
    // We use a ref or state to hold the 'active' tripId to separate from URL param
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (tripIdParam) {
            setSessionId(tripIdParam);
        } else {
            // Generate new Trip ID if none exists
            const newTripId = uuidv4();
            setSessionId(newTripId);

            // Clear existing state to prevent showing previous trip data
            setTripData({});
            setTripDetailInfo(null);

            // Update URL without reloading
            const newUrl = `/create-new-trip?tripId=${newTripId}`;
            router.replace(newUrl);
        }
    }, [tripIdParam]);

    // Load data from DB
    const dbMessages = useQuery(api.chat.GetMessages, sessionId ? { tripId: sessionId } : "skip");
    const dbTrip = useQuery(api.tripDetail.GetTrip, sessionId ? { tripId: sessionId } : "skip");

    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [tripData, setTripData] = useState<TripFormData>({});
    const { setTripDetailInfo } = useTripDetail();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isFinal, setIsFinal] = useState(false);
    const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);
    const pendingRequest = useRef<{ text: string; id: string } | null>(null);
    const sending = useRef(false);

    // Sync Messages from DB
    useEffect(() => {
        // Only sync from DB if we haven't initialized from a query
        // This prevents overwriting the user's first message from the landing page
        if (dbMessages && !initialized.current) {
            setMessages(dbMessages as Message[]);
        }
    }, [dbMessages]);

    // Sync Trip Data from DB
    useEffect(() => {
        if (dbTrip && dbTrip.tripDetail) {
            setTripData(dbTrip.tripDetail);
            setTripDetailInfo(dbTrip.tripDetail);

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
    }, [dbTrip, dbMessages]);

    // Auto-scroll to bottom (only within chat container, not entire page)
    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesContainerRef.current) {
                // Use scrollTop instead of scrollIntoView to prevent page scroll on mobile
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        if (query && !initialized.current) {
            initialized.current = true;
            onSend(query);
        }
    }, [query]);

    useEffect(() => {
        if (isFinal && userInput) {
            onSend();
        }
    }, [isFinal, userInput]);

    const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const onSend = async (msg?: string) => {
        const textToUse = msg || userInput;
        if (!textToUse?.trim() || sending.current) return;
        sending.current = true;

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

            if (pendingRequest.current?.text !== textToUse) {
                pendingRequest.current = { text: textToUse, id: crypto.randomUUID() };
            }
            const result = await axios.post("/api/aimodel", {
                messages: [...messages, { role: "user", content: textToUse }],
                isFinal: isFinal,
                requestId: pendingRequest.current.id
            });
            pendingRequest.current = null;
            if (result.data.credits) setCreditInfo(result.data.credits);

            if (isFinal && result.data.trip_plan) {
                // Handle Final Trip Plan
                const tripPlan = result.data.trip_plan as TripInfo;

                // Save to state
                setTripData(tripPlan);
                setTripDetailInfo(tripPlan);

                // Save to DB (Convex)
                if (userDetail && userDetail._id) {
                    const tripId = uuidv4();
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

        } catch (error) {
            console.error(error);

            // Enhanced error handling with specific messages
            let errorMessage = "Something went wrong. Please try again.";

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
        }
    }

    const handleUiSelect = (value: unknown) => {
        // Automatically send the selected value as a message
        onSend(String(value));
    }

    const handleGenerateTrip = async () => {
        setIsFinal(true);
        setUserInput("Generate my full travel plan now");
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const handleDeleteTrip = () => {
        if (confirm("Are you sure you want to delete this trip?")) {
            // Navigate to home after deletion
            router.push('/');
        }
        setIsMenuOpen(false);
    }

    return (
        <div className='flex flex-col h-full bg-white dark:bg-black relative text-sm md:text-base'>

            {/* TASK 2: Chat Header */}
            <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10'>
                <div className='flex items-center gap-3 min-w-0'>
                    <div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0'>
                        <Bot className='w-6 h-6 text-primary' />
                    </div>
                    <div className='min-w-0'>
                        <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100 truncate'>TripCraft Assistant</h2>
                        <p className='text-xs text-gray-500 truncate'>Ask me to plan your trip ✈️</p>
                    </div>
                </div>

                <div className='flex items-center gap-2 relative'>
                    <Button variant="ghost" size="icon" onClick={() => setMessages([])} title="Clear Chat">
                        <Wand2 className='w-4 h-4 text-gray-400' />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} title="More Options">
                        <MoreVertical className='w-4 h-4 text-gray-500' />
                    </Button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className='absolute top-10 right-0 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-lg overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-100'>
                            <button
                                onClick={() => router.push('/')}
                                className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2'
                            >
                                <ArrowLeft className="w-4 h-4" /> Go back to Dashboard
                            </button>
                            <button
                                onClick={handleDeleteTrip}
                                className='w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2'
                            >
                                <Trash2 className="w-4 h-4" /> Delete Trip
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* TASK 3: Chat Messages */}
            <div ref={messagesContainerRef} className='flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth'>
                {messages.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 opacity-100">
                        {tripData?.locationInfo ? (
                            // Existing Trip Summary Card (Empty State Upgrade)
                            <div className="w-full max-w-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-1">
                                    Planning trip to {String(tripData?.locationInfo?.name || "Unknown")}
                                </h3>
                                <div className="flex gap-3 text-xs text-gray-500 mb-4">
                                    <span className="bg-white dark:bg-black px-2 py-1 rounded border border-gray-100 dark:border-zinc-800">
                                        📅 {String(tripData?.tripDuration || "N/A")} Days
                                    </span>
                                    <span className="bg-white dark:bg-black px-2 py-1 rounded border border-gray-100 dark:border-zinc-800">
                                        💰 {String(tripData?.budget || "Flexible")} Budget
                                    </span>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => onSend("Continue planning this trip")}
                                >
                                    Continue planning this trip
                                </Button>
                            </div>
                        ) : (
                            // Generic Placeholder
                            <>
                                <Sparkles className="w-12 h-12 mb-2 opacity-50" />
                                <p className="opacity-50">Start a conversation to plan your trip.</p>
                            </>
                        )}
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`
                                max-w-[75%] px-5 py-3 text-sm leading-relaxed
                                ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-2xl rounded-br-sm shadow-lg shadow-orange-200/40 dark:shadow-orange-900/40'
                                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm border border-gray-200 dark:border-gray-700 shadow-sm'
                                }
                            `}
                        >
                            {msg.content}
                        </div>
                        {msg.timestamp && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                                {msg.timestamp}
                            </span>
                        )}

                        {/* Render Interactive UI if present */}
                        {msg.role === 'assistant' && msg.ui && (
                            <div className="w-full mt-2">
                                <UiRenderer
                                    uiType={msg.ui}
                                    onSelect={handleUiSelect}
                                    tripData={tripData}
                                    onGenerate={handleGenerateTrip}
                                    onEdit={() => setIsEditOpen(true)}
                                    loading={loading}
                                    disabled={messages.length - 1 !== index} // Disable if not the latest message? Optional.
                                />
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing Indicator */}
                {loading && (
                    <div className="flex flex-col items-start animate-pulse">
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">TripCraft is typing...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* TASK 4: Chat Input Area */}
            <div className='bg-white dark:bg-black sticky bottom-0 z-10'>
                {/* Visual Divider to separate chat from controls */}
                <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-4" />

                {/* Credit Status Zone */}
                <div className="mb-2">
                    <CreditDisplay key={creditInfo ? `${creditInfo.capacity}:${creditInfo.remaining}` : 'initial'} latest={creditInfo} />
                </div>

                <div className='px-4 pb-6'>
                    <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-1 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 transition-all">
                        <Textarea
                            placeholder="Type your message..."
                            className="min-h-[50px] max-h-[150px] w-full resize-none border-none bg-transparent shadow-none focus-visible:ring-0 p-3 pr-12 text-base"
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            value={userInput}
                        />
                        <Button
                            size="icon"
                            className={`absolute bottom-2 right-2 h-8 w-8 transition-all ${!userInput.trim() || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                            onClick={() => onSend()}
                            disabled={!userInput.trim() || loading}
                        >
                            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-center text-[10px] text-gray-400/60 mt-3">
                        Enter to send, Shift + Enter for new line
                    </p>
                </div>
            </div>

            {/* Edit Trip Modal */}
            <EditTripDialog
                open={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                currentData={tripData}
                onSave={(newData) => {
                    setTripData(newData);
                    // Optionally send a system message that data was updated?
                    // or just update silently. Let's update silently for now as UI reflects it.
                }}
            />
        </div>
    )
}

export default ChatBox
