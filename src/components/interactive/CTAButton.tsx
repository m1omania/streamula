import { ExternalLink } from 'lucide-react';

interface CTAButtonProps {
  text: string;
  url: string;
  color?: string;
}

export const CTAButton = ({ text, url, color = '#6366f1' }: CTAButtonProps) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity duration-150"
      style={{ backgroundColor: color }}
    >
      {text}
      <ExternalLink size={16} />
    </a>
  );
};


