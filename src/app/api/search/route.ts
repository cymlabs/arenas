import { NextResponse } from 'next/server';
import { generateVoices, generateTopics } from '@/lib/demoDataGenerator';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const voices = generateVoices();
    const topics = generateTopics();

    const voiceResults = voices
        .filter(v => v.display_name.toLowerCase().includes(query) || v.voice_id.includes(query))
        .map(v => ({
            id: v.voice_id,
            type: 'voice',
            label: v.display_name,
            subtext: v.category,
            url: `/voices/${v.voice_id}`
        }));

    const topicResults = topics
        .filter(t => t.label.toLowerCase().includes(query) || t.seed_keywords.some(k => k.includes(query)))
        .map(t => ({
            id: t.topic_id,
            type: 'topic',
            label: t.label,
            subtext: 'Topic',
            url: `/topics/${t.topic_id}` // Assuming topic pages exist or will exist
        }));

    return NextResponse.json({
        results: [...voiceResults, ...topicResults].slice(0, 10)
    });
}
