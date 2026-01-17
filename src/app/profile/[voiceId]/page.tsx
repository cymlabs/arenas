'use client';

import VoiceProfilePage from '@/components/profile/VoiceProfilePage';
import { useParams } from 'next/navigation';

export default function ProfilePage() {
    const params = useParams();
    const voiceId = params.voiceId as string;

    return <VoiceProfilePage voiceId={voiceId} />;
}
