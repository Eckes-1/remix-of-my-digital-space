import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking for scheduled posts to publish...');

    // Find posts that are scheduled for publication and the scheduled time has passed
    const now = new Date().toISOString();
    
    const { data: postsToPublish, error: selectError } = await supabase
      .from('posts')
      .select('id, title, scheduled_at')
      .eq('published', false)
      .not('scheduled_at', 'is', null)
      .lte('scheduled_at', now);

    if (selectError) {
      console.error('Error fetching scheduled posts:', selectError);
      throw selectError;
    }

    console.log(`Found ${postsToPublish?.length || 0} posts to publish`);

    if (!postsToPublish || postsToPublish.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No posts to publish', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Publish each post
    const publishedIds: string[] = [];
    const errors: string[] = [];

    for (const post of postsToPublish) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          published: true,
          published_at: post.scheduled_at, // Use the scheduled time as publish time
          scheduled_at: null, // Clear the schedule
        })
        .eq('id', post.id);

      if (updateError) {
        console.error(`Error publishing post ${post.id}:`, updateError);
        errors.push(`Failed to publish "${post.title}": ${updateError.message}`);
      } else {
        console.log(`Published post: ${post.title}`);
        publishedIds.push(post.id);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Published ${publishedIds.length} posts`,
        count: publishedIds.length,
        publishedIds,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in publish-scheduled-posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
