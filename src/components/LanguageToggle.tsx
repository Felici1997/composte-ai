import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Languages, Globe } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageToggleProps {
  variant?: 'button' | 'select' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'select',
  size = 'md',
  showIcon = true,
  showText = true
}) => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as Language, name: t('common.english'), flag: '🇺🇸' }
  ];

  const currentLang = languages.find(lang => lang.code === language);

  if (variant === 'button') {
    return (
      <div className="flex gap-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? 'default' : 'outline'}
            size={size}
            onClick={() => setLanguage(lang.code)}
            className={`${size === 'sm' ? 'px-2 py-1 text-xs' : size === 'lg' ? 'px-4 py-2' : 'px-3 py-1.5'}`}
          >
            {showIcon && <span className="mr-1">{lang.flag}</span>}
            {showText && <span>{lang.code.toUpperCase()}</span>}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className="flex gap-1">
        {languages.map((lang) => (
          <Badge
            key={lang.code}
            variant={language === lang.code ? 'default' : 'outline'}
            className={`cursor-pointer transition-all hover:scale-105 ${
              size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1'
            }`}
            onClick={() => setLanguage(lang.code)}
          >
            {showIcon && <span className="mr-1">{lang.flag}</span>}
            {showText && lang.code.toUpperCase()}
          </Badge>
        ))}
      </div>
    );
  }

  // Default select variant
  return (
    <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
      <SelectTrigger className={`${
        size === 'sm' ? 'w-24 h-8 text-xs' : size === 'lg' ? 'w-36 h-11' : 'w-32 h-9'
      } bg-card border-border`}>
        <SelectValue>
          <div className="flex items-center">
            {showIcon && <Globe className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />}
            {showText && (
              <span className="flex items-center">
                <span className="mr-1">{currentLang?.flag}</span>
                {currentLang?.name}
              </span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center">
              <span className="mr-2">{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Compact language display for mobile/small spaces (English-only)
export const CompactLanguageToggle: React.FC = () => {
  const { language } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 px-2 py-1 h-8 cursor-default"
      disabled
    >
      <Languages className="w-4 h-4" />
      <span className="text-xs font-medium">
        EN
      </span>
    </Button>
  );
};