import { NextResponse } from 'next/server';

// USGS Earthquake API - Real-time seismic data
const USGS_EARTHQUAKE_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';

interface USGSFeature {
    type: string;
    properties: {
        mag: number;
        place: string;
        time: number;
        updated: number;
        url: string;
        detail: string;
        felt: number | null;
        cdi: number | null;
        mmi: number | null;
        alert: string | null;
        status: string;
        tsunami: number;
        sig: number;
        net: string;
        code: string;
        ids: string;
        sources: string;
        types: string;
        nst: number | null;
        dmin: number | null;
        rms: number;
        gap: number | null;
        magType: string;
        type: string;
        title: string;
    };
    geometry: {
        type: string;
        coordinates: [number, number, number]; // [lng, lat, depth]
    };
    id: string;
}

interface ProcessedQuake {
    id: string;
    platform: 'usgs';
    title: string;
    magnitude: number;
    place: string;
    url: string;
    lat: number;
    lng: number;
    depth: number;
    created: string;
    tsunami: boolean;
    significance: number;
    alert: string | null;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'day'; // hour, day, week, month
    const minMagnitude = searchParams.get('min') || 'all'; // all, 1.0, 2.5, 4.5, significant

    try {
        // Build API URL based on parameters
        let endpoint: string;
        switch (minMagnitude) {
            case 'significant':
                endpoint = `${USGS_EARTHQUAKE_API}/significant_${timeframe}.geojson`;
                break;
            case '4.5':
                endpoint = `${USGS_EARTHQUAKE_API}/4.5_${timeframe}.geojson`;
                break;
            case '2.5':
                endpoint = `${USGS_EARTHQUAKE_API}/2.5_${timeframe}.geojson`;
                break;
            case '1.0':
                endpoint = `${USGS_EARTHQUAKE_API}/1.0_${timeframe}.geojson`;
                break;
            default:
                endpoint = `${USGS_EARTHQUAKE_API}/all_${timeframe}.geojson`;
        }

        const res = await fetch(endpoint, {
            headers: { 'User-Agent': 'CULTMINDS/1.0' },
            next: { revalidate: 300 },
        });

        if (!res.ok) {
            throw new Error(`USGS API responded with ${res.status}`);
        }

        const data = await res.json();
        const features: USGSFeature[] = data.features || [];

        const processedQuakes: ProcessedQuake[] = features.slice(0, 100).map(feature => ({
            id: `quake-${feature.id}`,
            platform: 'usgs' as const,
            title: feature.properties.title,
            magnitude: feature.properties.mag,
            place: feature.properties.place,
            url: feature.properties.url,
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            depth: feature.geometry.coordinates[2],
            created: new Date(feature.properties.time).toISOString(),
            tsunami: feature.properties.tsunami === 1,
            significance: feature.properties.sig,
            alert: feature.properties.alert,
        }));

        // Geographic clustering
        const regionCounts: Record<string, { count: number; maxMag: number }> = {};
        for (const quake of processedQuakes) {
            // Extract region from place (e.g., "10km NE of City, Country" -> "Country")
            const parts = quake.place.split(', ');
            const region = parts[parts.length - 1] || 'Unknown';

            if (!regionCounts[region]) {
                regionCounts[region] = { count: 0, maxMag: 0 };
            }
            regionCounts[region].count++;
            regionCounts[region].maxMag = Math.max(regionCounts[region].maxMag, quake.magnitude);
        }

        const hotspots = Object.entries(regionCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([region, data]) => ({ region, ...data }));

        return NextResponse.json({
            platform: 'usgs',
            earthquakes: processedQuakes,
            stats: {
                total: processedQuakes.length,
                avgMagnitude: processedQuakes.reduce((a, q) => a + q.magnitude, 0) / processedQuakes.length,
                maxMagnitude: Math.max(...processedQuakes.map(q => q.magnitude)),
                tsunamiWarnings: processedQuakes.filter(q => q.tsunami).length,
                alerts: {
                    red: processedQuakes.filter(q => q.alert === 'red').length,
                    orange: processedQuakes.filter(q => q.alert === 'orange').length,
                    yellow: processedQuakes.filter(q => q.alert === 'yellow').length,
                    green: processedQuakes.filter(q => q.alert === 'green').length,
                },
            },
            hotspots,
            metadata: data.metadata,
            fetchedAt: new Date().toISOString(),
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120' },
        });
    } catch (error) {
        console.error('USGS API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch earthquake data', details: String(error) },
            { status: 500 }
        );
    }
}
