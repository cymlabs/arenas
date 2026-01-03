import { UploadForm } from '@/components/sections/upload-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Panel } from '@/components/ui/panel';

export default async function SubmitPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: arena } = await supabase.from('arenas').select('name').eq('slug', params.slug).single();

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-3">
        <Panel className="p-6">
          <h1 className="text-2xl font-semibold">Upload to {arena?.name}</h1>
          <p className="text-white/60">Images are stored in the Supabase public bucket.</p>
          <div className="mt-6">
            <UploadForm arenaSlug={params.slug} />
          </div>
        </Panel>
      </div>
      <div className="md:col-span-2">
        <Panel className="p-6 space-y-3">
          <h3 className="text-lg font-semibold">Constraints</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• Only upload what you own. No scraping or AI faces.</li>
            <li>• Maximize clarity; avoid heavy compression.</li>
            <li>• Once uploaded, swipe-ready instantly.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
