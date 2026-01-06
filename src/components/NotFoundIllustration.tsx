import { cn } from "@/lib/utils";

interface NotFoundIllustrationProps {
  className?: string;
}

const NotFoundIllustration = ({ className }: NotFoundIllustrationProps) => {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full max-w-md", className)}
    >
      {/* Background circles */}
      <circle cx="200" cy="150" r="120" className="fill-primary/5" />
      <circle cx="200" cy="150" r="80" className="fill-primary/10" />
      
      {/* Floating book - animated */}
      <g className="animate-float" style={{ transformOrigin: '200px 120px' }}>
        {/* Book body */}
        <rect x="160" y="100" width="80" height="60" rx="4" className="fill-primary/80" />
        <rect x="162" y="102" width="76" height="56" rx="3" className="fill-card" />
        
        {/* Book spine */}
        <rect x="160" y="100" width="8" height="60" rx="2" className="fill-primary" />
        
        {/* Book pages lines */}
        <line x1="175" y1="115" x2="225" y2="115" className="stroke-muted-foreground/30" strokeWidth="2" strokeLinecap="round" />
        <line x1="175" y1="125" x2="220" y2="125" className="stroke-muted-foreground/30" strokeWidth="2" strokeLinecap="round" />
        <line x1="175" y1="135" x2="215" y2="135" className="stroke-muted-foreground/30" strokeWidth="2" strokeLinecap="round" />
        <line x1="175" y1="145" x2="210" y2="145" className="stroke-muted-foreground/30" strokeWidth="2" strokeLinecap="round" />
        
        {/* Question mark on book */}
        <text x="200" y="140" textAnchor="middle" className="fill-primary text-2xl font-bold" fontSize="24">?</text>
      </g>
      
      {/* Cute cat sitting - main character */}
      <g className="animate-bounce-gentle" style={{ animationDuration: '3s' }}>
        {/* Cat body */}
        <ellipse cx="200" cy="220" rx="45" ry="35" className="fill-amber-200 dark:fill-amber-300" />
        
        {/* Cat head */}
        <circle cx="200" cy="180" r="35" className="fill-amber-200 dark:fill-amber-300" />
        
        {/* Cat ears */}
        <path d="M170 155 L165 130 L185 150 Z" className="fill-amber-200 dark:fill-amber-300" />
        <path d="M230 155 L235 130 L215 150 Z" className="fill-amber-200 dark:fill-amber-300" />
        <path d="M172 152 L169 135 L183 149 Z" className="fill-pink-300" />
        <path d="M228 152 L231 135 L217 149 Z" className="fill-pink-300" />
        
        {/* Cat face - eyes */}
        <circle cx="185" cy="175" r="8" className="fill-foreground" />
        <circle cx="215" cy="175" r="8" className="fill-foreground" />
        <circle cx="187" cy="173" r="3" className="fill-white" />
        <circle cx="217" cy="173" r="3" className="fill-white" />
        
        {/* Cat nose */}
        <ellipse cx="200" cy="188" rx="5" ry="4" className="fill-pink-400" />
        
        {/* Cat mouth */}
        <path d="M200 192 Q195 200 190 195" className="stroke-foreground/50" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M200 192 Q205 200 210 195" className="stroke-foreground/50" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Cat whiskers */}
        <line x1="165" y1="185" x2="180" y2="188" className="stroke-foreground/30" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="165" y1="192" x2="180" y2="192" className="stroke-foreground/30" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="220" y1="188" x2="235" y2="185" className="stroke-foreground/30" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="220" y1="192" x2="235" y2="192" className="stroke-foreground/30" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Cat tail */}
        <path 
          d="M245 220 Q270 210 265 180 Q260 160 275 150" 
          className="stroke-amber-200 dark:stroke-amber-300" 
          strokeWidth="12" 
          fill="none" 
          strokeLinecap="round"
        />
        
        {/* Cat paws */}
        <ellipse cx="175" cy="245" rx="15" ry="10" className="fill-amber-200 dark:fill-amber-300" />
        <ellipse cx="225" cy="245" rx="15" ry="10" className="fill-amber-200 dark:fill-amber-300" />
        
        {/* Paw details */}
        <circle cx="170" cy="248" r="3" className="fill-pink-300" />
        <circle cx="175" cy="250" r="3" className="fill-pink-300" />
        <circle cx="180" cy="248" r="3" className="fill-pink-300" />
        <circle cx="220" cy="248" r="3" className="fill-pink-300" />
        <circle cx="225" cy="250" r="3" className="fill-pink-300" />
        <circle cx="230" cy="248" r="3" className="fill-pink-300" />
      </g>
      
      {/* Floating elements */}
      <g className="animate-float" style={{ animationDelay: '0.5s' }}>
        <circle cx="100" cy="100" r="8" className="fill-primary/20" />
        <circle cx="320" cy="80" r="6" className="fill-accent/20" />
        <circle cx="80" cy="200" r="5" className="fill-primary/15" />
        <circle cx="340" cy="180" r="7" className="fill-accent/15" />
      </g>
      
      {/* Stars */}
      <g className="animate-pulse">
        <path d="M90 140 L92 145 L97 145 L93 149 L95 154 L90 151 L85 154 L87 149 L83 145 L88 145 Z" className="fill-primary/40" />
        <path d="M310 120 L312 125 L317 125 L313 129 L315 134 L310 131 L305 134 L307 129 L303 125 L308 125 Z" className="fill-accent/40" />
        <path d="M350 220 L351.5 224 L356 224 L352.5 227 L354 231 L350 228.5 L346 231 L347.5 227 L344 224 L348.5 224 Z" className="fill-primary/30" />
        <path d="M60 160 L61.5 164 L66 164 L62.5 167 L64 171 L60 168.5 L56 171 L57.5 167 L54 164 L58.5 164 Z" className="fill-accent/30" />
      </g>
      
      {/* Ground shadow */}
      <ellipse cx="200" cy="260" rx="70" ry="10" className="fill-foreground/5" />
    </svg>
  );
};

export default NotFoundIllustration;
