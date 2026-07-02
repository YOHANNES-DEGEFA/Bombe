import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { db, waitForFirestoreNetwork } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

const CreateRoomModal = ({ onClose, onRoomCreated }) => {
    const [roomName, setRoomName] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const isSubmittingRef = useRef(false);
    const { user: currentUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    const handleClose = () => {
        if (isSubmittingRef.current) return;
        setIsVisible(false);
        onClose();
    };

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (isSubmittingRef.current) return;
        if (!roomName.trim()) return toast.error('Please enter a room name.');
        if (!currentUser) return toast.error('Please log in to create a room.');

        isSubmittingRef.current = true;

        const trimmedName = roomName.trim();
        const roomRef = doc(collection(db, 'rooms'));
        const optimisticRoom = {
            id: roomRef.id,
            name: trimmedName,
            createdBy: currentUser.uid,
            createdByUsername: currentUser.displayName || 'Anonymous',
            createdAt: new Date(),
            members: [currentUser.uid],
            currentMediaId: null,
            currentMediaType: null,
        };

        setIsVisible(false);
        onClose();
        onRoomCreated(optimisticRoom);
        toast.success(`Room "${trimmedName}" created!`);
        void router.push(`/rooms/${roomRef.id}`);

        void waitForFirestoreNetwork()
            .then(() =>
                setDoc(roomRef, {
                    name: trimmedName,
                    createdBy: currentUser.uid,
                    createdByUsername: currentUser.displayName || 'Anonymous',
                    createdAt: serverTimestamp(),
                    members: [currentUser.uid],
                    currentMediaId: null,
                    currentMediaType: null,
                })
            )
            .catch((error) => {
                console.error('Error creating room:', error);
                toast.error('Failed to save room. Please try again.');
            })
            .finally(() => {
                isSubmittingRef.current = false;
            });
    };

    if (!isMounted || !isVisible) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4"
            onClick={handleClose}
        >
            <div
                className="bg-secondary rounded-lg shadow-xl w-full max-w-md p-6 relative"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-textsecondary hover:text-accent transition-colors text-2xl"
                    aria-label="Close modal"
                >
                    <IoClose />
                </button>
                <h2 className="text-xl font-semibold text-textprimary mb-4">Create Watch Party Room</h2>
                <form onSubmit={handleCreateRoom}>
                    <div className="mb-4">
                        <label htmlFor="roomName" className="block text-sm font-medium text-textsecondary mb-1">
                            Room Name
                        </label>
                        <input
                            type="text"
                            id="roomName"
                            value={roomName}
                            onChange={(event) => setRoomName(event.target.value)}
                            placeholder="e.g., Friday Movie Night"
                            className="w-full bg-primary border border-secondary-light rounded-md p-2 text-textprimary focus:ring-accent focus:border-accent placeholder-textsecondary/50"
                            required
                            maxLength={50}
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!roomName.trim()}
                        className="w-full bg-accent hover:bg-accent-hover text-on-accent font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Room
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default CreateRoomModal;
