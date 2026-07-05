import { Link } from 'react-router-dom';

const LOGO_SRC = '/stylesutra-logo.png';

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
  /** Router destination (default storefront home). */
  to?: string;
  /** Fill the full height of a fixed-height bar (e.g. h-16 navbar). */
  fillHeight?: boolean;
};

export default function BrandLogo({
  className = '',
  imageClassName = '',
  onClick,
  to = '/',
  fillHeight = false,
}: BrandLogoProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`inline-flex shrink-0 py-0 my-0 ${
        fillHeight ? 'self-stretch h-full' : 'items-center'
      } ${className}`}
      aria-label="StyleSutra home"
    >
      <img
        src={LOGO_SRC}
        alt="StyleSutra"
        className={`block object-contain object-left py-0 my-0 w-auto ${
          fillHeight
            ? 'h-full max-h-full'
            : 'h-12 max-w-[220px] sm:max-w-[240px]'
        } ${imageClassName}`}
      />
    </Link>
  );
}

export { LOGO_SRC };
