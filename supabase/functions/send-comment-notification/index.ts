import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  commenterEmail: string;
  commenterName: string;
  postTitle: string;
  postSlug: string;
  adminReply: string;
  originalComment: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email notification");
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { commenterEmail, commenterName, postTitle, postSlug, adminReply, originalComment }: NotificationRequest = await req.json();

    console.log(`Sending notification to ${commenterEmail} for comment on "${postTitle}"`);

    const siteUrl = Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '') || 'https://your-site.com';

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Blog <onboarding@resend.dev>",
        to: [commenterEmail],
        subject: `您在「${postTitle}」的评论收到了回复`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .comment-box { background: white; border-left: 4px solid #e5e7eb; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
              .reply-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">您的评论收到了回复 💬</h1>
              </div>
              <div class="content">
                <p>亲爱的 <strong>${commenterName}</strong>，</p>
                <p>您在文章「<strong>${postTitle}</strong>」中的评论收到了管理员的回复：</p>
                
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">您的评论：</p>
                <div class="comment-box">
                  ${originalComment}
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">管理员回复：</p>
                <div class="reply-box">
                  ${adminReply}
                </div>
                
                <a href="${siteUrl}/blog/${postSlug}" class="button">查看完整评论</a>
              </div>
              <div class="footer">
                <p>感谢您的参与和支持！</p>
                <p>如果您不想再收到此类通知，请忽略此邮件。</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Email send failed:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
