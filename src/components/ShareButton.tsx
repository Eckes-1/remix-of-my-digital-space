import { useState } from "react";
import { Share2, Link2, Twitter, Facebook, Check, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCode from 'react-qr-code';

interface ShareButtonProps {
  title: string;
  url?: string;
  className?: string;
}

const ShareButton = ({ title, url, className }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [activeQRTab, setActiveQRTab] = useState<string>('wechat');
  
  const shareUrl = url || window.location.href;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "链接已复制", description: "文章链接已复制到剪贴板" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(title);
    const link = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${link}`, "_blank");
  };

  const shareToFacebook = () => {
    const link = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}`, "_blank");
  };

  const getWeiboUrl = () => {
    const text = encodeURIComponent(title);
    const link = encodeURIComponent(shareUrl);
    return `https://service.weibo.com/share/share.php?title=${text}&url=${link}`;
  };

  const openQRDialog = (platform: string) => {
    setIsOpen(false);
    setActiveQRTab(platform);
    setShowQRDialog(true);
  };

  // Platform-specific QR code configurations
  const platforms = {
    wechat: {
      name: '微信',
      icon: <MessageCircle className="w-5 h-5" />,
      url: shareUrl,
      color: 'from-green-500 to-green-600',
      description: '打开微信扫一扫，分享给好友或朋友圈',
    },
    weibo: {
      name: '微博',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.82 13.87c-.21.55-.83.82-1.38.6-.55-.21-.82-.83-.6-1.38.21-.55.83-.82 1.38-.6.55.21.82.83.6 1.38zm1.17-1.55c-.08.2-.31.3-.51.22-.2-.08-.3-.31-.22-.51.08-.2.31-.3.51-.22.2.08.3.31.22.51zm.59 4.11c-1.67 1.36-3.57 1.45-4.25.2-.68-1.25.1-3.28 1.77-4.64 1.67-1.36 3.57-1.45 4.25-.2.68 1.25-.1 3.28-1.77 4.64zm7.02-3.63c-.27-1.98-2.39-3.4-4.78-3.22-.55.04-1.08.15-1.58.32.14-.47.22-.97.22-1.48 0-2.21-1.34-4-3-4s-3 1.79-3 4c0 .39.04.77.12 1.14C4.78 10.08 3 11.87 3 14c0 2.76 3.13 5 7 5s7-2.24 7-5c0-.42-.05-.82-.15-1.2 1.02-.25 1.82-.92 1.75-1.8zM20 5.5c0 1.38-1.12 2.5-2.5 2.5S15 6.88 15 5.5 16.12 3 17.5 3 20 4.12 20 5.5zm1 2.5c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z"/>
        </svg>
      ),
      url: getWeiboUrl(),
      color: 'from-red-500 to-orange-500',
      description: '打开微博客户端扫码，分享到微博',
    },
    twitter: {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'from-sky-400 to-blue-500',
      description: '使用手机扫码在 Twitter 上分享',
    },
    facebook: {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'from-blue-600 to-blue-700',
      description: '使用手机扫码在 Facebook 上分享',
    },
  };

  return (
    <>
      <div className={cn("relative", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-300",
            "border border-border hover:border-primary/50",
            "bg-card text-muted-foreground hover:text-primary",
            "text-sm sm:text-base"
          )}
        >
          <Share2 className="w-4 h-4" />
          <span className="font-medium hidden sm:inline">分享</span>
        </button>

        {/* Dropdown - improved mobile positioning */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute bottom-full mb-2 right-0 sm:left-1/2 sm:-translate-x-1/2 z-50 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[160px] animate-fade-in">
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                复制链接
              </button>
              <button
                onClick={() => openQRDialog('wechat')}
                className="w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                微信二维码
              </button>
              <button
                onClick={() => openQRDialog('weibo')}
                className="w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.82 13.87c-.21.55-.83.82-1.38.6-.55-.21-.82-.83-.6-1.38.21-.55.83-.82 1.38-.6.55.21.82.83.6 1.38zm1.17-1.55c-.08.2-.31.3-.51.22-.2-.08-.3-.31-.22-.51.08-.2.31-.3.51-.22.2.08.3.31.22.51zm.59 4.11c-1.67 1.36-3.57 1.45-4.25.2-.68-1.25.1-3.28 1.77-4.64 1.67-1.36 3.57-1.45 4.25-.2.68 1.25-.1 3.28-1.77 4.64zm7.02-3.63c-.27-1.98-2.39-3.4-4.78-3.22-.55.04-1.08.15-1.58.32.14-.47.22-.97.22-1.48 0-2.21-1.34-4-3-4s-3 1.79-3 4c0 .39.04.77.12 1.14C4.78 10.08 3 11.87 3 14c0 2.76 3.13 5 7 5s7-2.24 7-5c0-.42-.05-.82-.15-1.2 1.02-.25 1.82-.92 1.75-1.8zM20 5.5c0 1.38-1.12 2.5-2.5 2.5S15 6.88 15 5.5 16.12 3 17.5 3 20 4.12 20 5.5zm1 2.5c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z"/>
                </svg>
                微博二维码
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </button>
              <button
                onClick={shareToFacebook}
                className="w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 transition-colors"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </button>
            </div>
          </>
        )}
      </div>

      {/* QR Code Dialog with Tabs - optimized for mobile */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-base sm:text-lg">扫码分享到社交平台</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeQRTab} onValueChange={setActiveQRTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              {Object.entries(platforms).map(([key, platform]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="flex flex-col sm:flex-row items-center gap-1 text-xs py-2 px-1"
                >
                  <span className="[&>svg]:w-4 [&>svg]:h-4">{platform.icon}</span>
                  <span className="text-[10px] sm:text-xs">{platform.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(platforms).map(([key, platform]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  {/* Platform header */}
                  <div className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-sm",
                    `bg-gradient-to-r ${platform.color}`
                  )}>
                    {platform.icon}
                    <span className="font-medium">{platform.name}</span>
                  </div>
                  
                  {/* QR Code */}
                  <div className="bg-white p-3 sm:p-4 rounded-xl shadow-lg">
                    <QRCode 
                      value={platform.url} 
                      size={160}
                      level="M"
                    />
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs px-2">
                    {platform.description}
                  </p>
                  
                  {/* Copy link button */}
                  <button
                    onClick={copyLink}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
                      "border border-border hover:bg-secondary transition-colors"
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        复制链接
                      </>
                    )}
                  </button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareButton;