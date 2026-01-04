import { ReactNode, useMemo } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface TextReplacerProps {
  children: string;
}

const TextReplacer = ({ children }: TextReplacerProps) => {
  const { data: siteSettings } = useSiteSettings();
  
  const replacedText = useMemo(() => {
    if (!siteSettings?.textReplacements?.length) return children;
    
    let result = children;
    for (const replacement of siteSettings.textReplacements) {
      if (replacement.from && replacement.to) {
        result = result.split(replacement.from).join(replacement.to);
      }
    }
    return result;
  }, [children, siteSettings?.textReplacements]);
  
  return <>{replacedText}</>;
};

export const useTextReplacer = () => {
  const { data: siteSettings } = useSiteSettings();
  
  return (text: string): string => {
    if (!siteSettings?.textReplacements?.length) return text;
    
    let result = text;
    for (const replacement of siteSettings.textReplacements) {
      if (replacement.from && replacement.to) {
        result = result.split(replacement.from).join(replacement.to);
      }
    }
    return result;
  };
};

export default TextReplacer;
