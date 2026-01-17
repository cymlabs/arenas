'use client';

/**
 * TopicRadarView - Show all voices' stance distribution on a topic
 * 
 * Features:
 * - Stance spectrum distribution (histogram)
 * - Mindshare-weighted stance indicator
 * - Top voices by mindshare
 * - Change alerts
 */

import React, { useMemo } from 'react';
import { useStanceStore } from '@/lib/stanceStore';
import { stanceToColor, stanceToLabel } from '@/types/stance';

interface TopicRadarViewProps {
    topicId: string;
    onVoiceClick?: (voiceId: string) => void;
}

// Calculate week ago once at module load (stable reference)
const WEEK_MS = 7 * 24 * 3600000;

export default function TopicRadarView({
    topicId,
    onVoiceClick,
}: TopicRadarViewProps) {
    const {
        getTopicDistribution,
        getFlipEventsForTopic,
        voices,
        topics,
    } = useStanceStore();

    const topic = topics.find(t => t.topic_id === topicId);
    const distribution = getTopicDistribution(topicId);
    const flipEvents = getFlipEventsForTopic(topicId);

    // Get recent change alerts - filter events from last week
    // Using a function that gets current time when called (not during render)
    const recentAlerts = useMemo(() => {
        // Get the cutoff time for "recent" (within last week)
        const cutoffTime = new Date();
        cutoffTime.setTime(cutoffTime.getTime() - WEEK_MS);

        return flipEvents
            .filter(f => new Date(f.t0) > cutoffTime)
            .sort((a, b) => new Date(b.t0).getTime() - new Date(a.t0).getTime())
            .map(flip => {
                const voice = voices.find(v => v.voice_id === flip.voice_id);
                const direction = flip.delta_stance > 0 ? 'toward support' : 'toward opposition';
                return {
                    id: flip.id,
                    voice: voice?.display_name || flip.voice_id,
                    voiceId: flip.voice_id,
                    text: `${voice?.display_name || flip.voice_id} drifted ${direction}`,
                    timestamp: flip.t0,
                    delta: flip.delta_stance,
                };
            });
    }, [flipEvents, voices]);

    if (!distribution) {
        return (
            <div className="radar-view radar-view--empty">
                <p>No stance data for this topic</p>
            </div>
        );
    }

    const total = distribution.distribution.against + distribution.distribution.neutral + distribution.distribution.for;
    const againstPct = (distribution.distribution.against / total) * 100;
    const neutralPct = (distribution.distribution.neutral / total) * 100;
    const forPct = (distribution.distribution.for / total) * 100;

    return (
        <div className="radar-view">
            <div className="radar-view__header">
                <h3>{topic?.label || topicId}</h3>
                <span className="radar-view__category">{topic?.category}</span>
            </div>

            {/* Stance Spectrum */}
            <div className="radar-view__spectrum">
                <h4>Stance Spectrum</h4>
                <div className="spectrum-bar">
                    <div
                        className="spectrum-segment spectrum-segment--against"
                        style={{ width: `${againstPct}%` }}
                    >
                        {againstPct > 10 && <span>{distribution.distribution.against}</span>}
                    </div>
                    <div
                        className="spectrum-segment spectrum-segment--neutral"
                        style={{ width: `${neutralPct}%` }}
                    >
                        {neutralPct > 10 && <span>{distribution.distribution.neutral}</span>}
                    </div>
                    <div
                        className="spectrum-segment spectrum-segment--for"
                        style={{ width: `${forPct}%` }}
                    >
                        {forPct > 10 && <span>{distribution.distribution.for}</span>}
                    </div>
                </div>
                <div className="spectrum-labels">
                    <span>Against ({distribution.distribution.against})</span>
                    <span>Neutral ({distribution.distribution.neutral})</span>
                    <span>For ({distribution.distribution.for})</span>
                </div>
            </div>

            {/* Mindshare-Weighted Stance */}
            <div className="radar-view__weighted">
                <h4>Dominant Narrative</h4>
                <div className="weighted-indicator">
                    <div className="weighted-bar">
                        <div
                            className="weighted-marker"
                            style={{
                                left: `${(distribution.mindshare_weighted_stance + 1) * 50}%`,
                                backgroundColor: stanceToColor(distribution.mindshare_weighted_stance),
                            }}
                        />
                    </div>
                    <div className="weighted-labels">
                        <span>Against</span>
                        <span className="weighted-value" style={{ color: stanceToColor(distribution.mindshare_weighted_stance) }}>
                            {stanceToLabel(distribution.mindshare_weighted_stance)}
                        </span>
                        <span>For</span>
                    </div>
                </div>
                <p className="weighted-description">
                    Weighted by mindshare, the overall narrative leans{' '}
                    <strong style={{ color: stanceToColor(distribution.mindshare_weighted_stance) }}>
                        {distribution.mindshare_weighted_stance > 0.1 ? 'supportive' :
                            distribution.mindshare_weighted_stance < -0.1 ? 'critical' : 'neutral'}
                    </strong>
                </p>
            </div>

            {/* Top Voices */}
            <div className="radar-view__top-voices">
                <h4>Top Voices by Mindshare</h4>
                <div className="voices-list">
                    {distribution.top_voices.slice(0, 8).map((item, i) => {
                        const voice = voices.find(v => v.voice_id === item.voice_id);
                        return (
                            <div
                                key={item.voice_id}
                                className="voice-item"
                                onClick={() => onVoiceClick?.(item.voice_id)}
                            >
                                <span className="voice-rank">#{i + 1}</span>
                                <div className="voice-info">
                                    <span className="voice-name">{voice?.display_name || item.voice_id}</span>
                                    <span className="voice-mindshare">{item.mindshare.toFixed(1)}% mindshare</span>
                                </div>
                                <div
                                    className="voice-stance-indicator"
                                    style={{ backgroundColor: stanceToColor(item.stance) }}
                                    title={stanceToLabel(item.stance)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Change Alerts */}
            {recentAlerts.length > 0 && (
                <div className="radar-view__alerts">
                    <h4>⚡ Recent Changes</h4>
                    <div className="alerts-list">
                        {recentAlerts.slice(0, 5).map(alert => (
                            <div
                                key={alert.id}
                                className="alert-item"
                                onClick={() => onVoiceClick?.(alert.voiceId)}
                            >
                                <span
                                    className="alert-icon"
                                    style={{ color: alert.delta > 0 ? '#22c55e' : '#ef4444' }}
                                >
                                    {alert.delta > 0 ? '↗' : '↘'}
                                </span>
                                <span className="alert-text">{alert.text}</span>
                                <span className="alert-time">
                                    {new Date(alert.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .radar-view {
                    background: linear-gradient(145deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.98));
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 16px;
                    padding: 24px;
                    backdrop-filter: blur(20px);
                }

                .radar-view--empty {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 300px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .radar-view__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .radar-view__header h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                }

                .radar-view__category {
                    background: rgba(59, 130, 246, 0.2);
                    border: 1px solid rgba(59, 130, 246, 0.4);
                    border-radius: 12px;
                    padding: 4px 12px;
                    font-size: 11px;
                    color: #3b82f6;
                    text-transform: capitalize;
                }

                h4 {
                    margin: 0 0 12px 0;
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Spectrum */
                .radar-view__spectrum {
                    margin-bottom: 24px;
                }

                .spectrum-bar {
                    display: flex;
                    height: 40px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.05);
                }

                .spectrum-segment {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    transition: all 0.3s ease;
                }

                .spectrum-segment--against {
                    background: linear-gradient(90deg, #dc2626, #ef4444);
                }

                .spectrum-segment--neutral {
                    background: linear-gradient(90deg, #6b7280, #9ca3af);
                }

                .spectrum-segment--for {
                    background: linear-gradient(90deg, #22c55e, #16a34a);
                }

                .spectrum-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                }

                /* Weighted Indicator */
                .radar-view__weighted {
                    margin-bottom: 24px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                }

                .weighted-bar {
                    position: relative;
                    height: 8px;
                    background: linear-gradient(90deg, #ef4444, #6b7280 50%, #22c55e);
                    border-radius: 4px;
                    margin-bottom: 8px;
                }

                .weighted-marker {
                    position: absolute;
                    top: -6px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid #fff;
                    transform: translateX(-50%);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                .weighted-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .weighted-value {
                    font-weight: 600;
                    font-size: 12px;
                }

                .weighted-description {
                    margin: 12px 0 0 0;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                    text-align: center;
                }

                /* Top Voices */
                .radar-view__top-voices {
                    margin-bottom: 24px;
                }

                .voices-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .voice-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .voice-item:hover {
                    background: rgba(255, 255, 255, 0.08);
                }

                .voice-rank {
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.4);
                    min-width: 24px;
                }

                .voice-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .voice-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: #fff;
                }

                .voice-mindshare {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .voice-stance-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                /* Alerts */
                .radar-view__alerts {
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .alerts-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .alert-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    background: rgba(245, 158, 11, 0.1);
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .alert-item:hover {
                    background: rgba(245, 158, 11, 0.15);
                }

                .alert-icon {
                    font-size: 16px;
                    font-weight: 700;
                }

                .alert-text {
                    flex: 1;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                }

                .alert-time {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                }
            `}</style>
        </div>
    );
}
