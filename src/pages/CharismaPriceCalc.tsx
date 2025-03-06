import { useState, useRef, useEffect } from 'react';
import { strings } from '../constants/strings';
import { charismaTable } from '../constants/charismaTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

export default function CharismaPriceCalc() {
  const [charisma, setCharisma] = useState<string>('5');
  const [vendorPrice, setVendorPrice] = useState<string>('50');
  const [errors, setErrors] = useState({ charisma: '', vendorPrice: '' });
  const [announcement, setAnnouncement] = useState('');
  
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Get the user's locale, falling back to 'en-US' if not available
  const userLocale = typeof navigator !== 'undefined' 
    ? navigator.language || navigator.languages[0] || 'en-US'
    : 'en-US';

  // Add unique IDs for form controls
  const charismaInputId = "charisma-input";
  const charismaErrorId = "charisma-error";
  const vendorPriceInputId = "vendor-price-input";
  const vendorPriceErrorId = "vendor-price-error";
  const vendorPriceDescId = "vendor-price-desc";

  useEffect(() => {
    if (highlightedRowRef.current && typeof charisma === 'number' && typeof vendorPrice === 'number') {
      highlightedRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      highlightedRowRef.current.focus();
      highlightedRowRef.current.setAttribute('aria-label', 
        `Selected row: Charisma ${charisma}, Buy Price ${calculatePrices(vendorPrice).find(entry => entry.charisma === charisma)?.buyPrice}`
      );
    }
  }, [charisma, vendorPrice]);

  useEffect(() => {
    const numCharisma = Number(charisma);
    if (isNaN(numCharisma) || errors.charisma || !tableRef.current) return;

    const observer = new ResizeObserver(() => {
      const row = tableRef.current?.querySelector(`tr[data-charisma="${numCharisma}"]`);
      if (row && tableRef.current) {
        const rowTop = (row as HTMLElement).offsetTop;
        const containerHeight = tableRef.current.clientHeight;
        const scrollPosition = rowTop - (containerHeight / 2) + (row as HTMLElement).offsetHeight / 2;
        
        tableRef.current.scrollTop = scrollPosition;
      }
    });

    observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, [charisma, errors.charisma]);

  const handleCharismaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCharisma(value);
    
    if (value === '') {
      setErrors(prev => ({ ...prev, charisma: `Please enter a Charisma value (${formatNumber(1)}-${formatNumber(100)})` }));
    } else if (Number(value) < 1 || Number(value) > 100) {
      setErrors(prev => ({ ...prev, charisma: `Charisma must be between ${formatNumber(1)} and ${formatNumber(100)}` }));
    } else {
      setErrors(prev => ({ ...prev, charisma: '' }));
    }
  };

  const handleVendorPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVendorPrice(value);
    
    if (value === '') {
      setErrors(prev => ({ ...prev, vendorPrice: `Please enter a Vendor Price value (${formatNumber(1)}-${formatNumber(40000)})` }));
    } else if (Number(value) < 1 || Number(value) > 40000) {
      setErrors(prev => ({ ...prev, vendorPrice: `Vendor Price must be between ${formatNumber(1)} and ${formatNumber(40000)}` }));
    } else {
      setErrors(prev => ({ ...prev, vendorPrice: '' }));
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(userLocale).format(num);
  };

  const calculatePrices = (price: string) => {
    const numCharisma = Number(charisma);
    const numPrice = Number(price);
    
    if (isNaN(numCharisma) || isNaN(numPrice) || errors.charisma || errors.vendorPrice) return [];
    
    const currentModifiers = charismaTable.find(entry => entry.charisma === numCharisma);
    if (!currentModifiers) return [];
    
    const basePrice = numPrice / currentModifiers.buyModifier;
    
    return charismaTable.map((entry) => ({
      charisma: entry.charisma,
      buyPrice: formatNumber(Number((basePrice * entry.buyModifier).toFixed(2))),
    }));
  };

  const priceTable = vendorPrice ? calculatePrices(vendorPrice) : [];

  const handleTableKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    const currentCharisma = Number(charisma);
    const rows = priceTable.map(entry => entry.charisma);
    const currentIndex = rows.indexOf(currentCharisma);
    const totalRows = rows.length;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          const newCharisma = rows[currentIndex - 1];
          setCharisma(newCharisma.toString());
          announceRowChange(newCharisma, currentIndex - 1, totalRows);
        } else {
          setAnnouncement('At first row');
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < rows.length - 1) {
          const newCharisma = rows[currentIndex + 1];
          setCharisma(newCharisma.toString());
          announceRowChange(newCharisma, currentIndex + 1, totalRows);
        } else {
          setAnnouncement('At last row');
        }
        break;
      case 'Home':
        e.preventDefault();
        const firstCharisma = rows[0];
        setCharisma(firstCharisma.toString());
        announceRowChange(firstCharisma, 0, totalRows);
        break;
      case 'End':
        e.preventDefault();
        const lastCharisma = rows[rows.length - 1];
        setCharisma(lastCharisma.toString());
        announceRowChange(lastCharisma, rows.length - 1, totalRows);
        break;
      case 'PageUp':
        e.preventDefault();
        const pageUpIndex = Math.max(0, currentIndex - 10);
        const pageUpCharisma = rows[pageUpIndex];
        setCharisma(pageUpCharisma.toString());
        announceRowChange(pageUpCharisma, pageUpIndex, totalRows);
        break;
      case 'PageDown':
        e.preventDefault();
        const pageDownIndex = Math.min(rows.length - 1, currentIndex + 10);
        const pageDownCharisma = rows[pageDownIndex];
        setCharisma(pageDownCharisma.toString());
        announceRowChange(pageDownCharisma, pageDownIndex, totalRows);
        break;
    }
  };

  const announceRowChange = (charismaValue: number, index: number, total: number) => {
    const entry = priceTable.find(e => e.charisma === charismaValue);
    if (entry) {
      setAnnouncement(
        `Row ${index + 1} of ${total}. Charisma ${entry.charisma}, Buy Price ${entry.buyPrice}`
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncement('');
    }, 2000);
    return () => clearTimeout(timer);
  }, [announcement]);

  useEffect(() => {
    if (!errors.vendorPrice && vendorPrice) {
      const currentEntry = priceTable.find(e => e.charisma === Number(charisma));
      if (currentEntry) {
        setAnnouncement(`Updated prices. Current row: Charisma ${currentEntry.charisma}, Buy Price ${currentEntry.buyPrice}`);
      }
    }
  }, [vendorPrice, priceTable]);

  return (
    <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-4xl">
      {/* Skip link */}
      <a 
        href="#price-table"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2"
        style={{
          backgroundColor: 'var(--light-contrast)',
          borderColor: 'var(--main-accent)',
        }}
      >
        Skip to price table
      </a>

      {/* Live region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>

      <h1 
        className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6"
        style={{ color: 'var(--dark-contrast)' }}
      >
        {strings.charismaPriceCalc.title}
      </h1>

      <section aria-labelledby="charisma-source-heading" className="mb-4 sm:mb-8">
        <h2 id="charisma-source-heading" className="text-xl sm:text-2xl font-semibold mb-2">
          <a
            href={strings.charismaPriceCalc.sourceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
            style={{ 
              color: 'var(--main-accent)',
              '&:hover': { color: 'var(--secondary-accent)' }
            }}
          >
            {strings.charismaPriceCalc.sourceCredits}
          </a>
        </h2>
        <p style={{ color: 'var(--dark-contrast)' }} className="text-sm opacity-75">
          {strings.charismaPriceCalc.sourceDate}
        </p>
      </section>
      
      {/* Form section */}
      <section 
        aria-labelledby="form-heading" 
        className="rounded-t-lg shadow-sm border border-b-0"
        style={{ 
          backgroundColor: 'var(--light-contrast)',
          borderColor: 'var(--secondary-accent)'
        }}
      >
        <h2 
          id="form-heading" 
          className="text-lg font-semibold p-4 border-b"
          style={{ 
            borderColor: 'var(--secondary-accent)',
            color: 'var(--dark-contrast)'
          }}
        >
          Calculator Inputs
        </h2>
        
        <div className="grid gap-4 sm:grid-cols-2 p-4">
          <div>
            <label htmlFor={charismaInputId} className="block text-sm font-medium mb-1" style={{ color: 'var(--dark-contrast)' }}>
              Charisma Stat
              <span className="inline-flex items-center ml-1.5 group relative">
                <FontAwesomeIcon 
                  icon={faCircleInfo}
                  className="h-4 w-4" 
                  style={{ color: 'var(--secondary-accent)' }}
                  aria-hidden="true"
                />
                <span className="sr-only">Valid range information</span>
                <div 
                  className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs rounded shadow-lg whitespace-nowrap z-10"
                  style={{ 
                    backgroundColor: 'var(--dark-contrast)',
                    color: 'var(--light-contrast)'
                  }}
                >
                  Valid range: {formatNumber(1)} - {formatNumber(100)}
                </div>
              </span>
            </label>
            <input
              id={charismaInputId}
              type="number"
              value={charisma}
              onChange={handleCharismaChange}
              aria-invalid={!!errors.charisma}
              aria-describedby={`${errors.charisma ? charismaErrorId : ''} charisma-range-desc`}
              className="w-full rounded-md shadow-sm text-base px-3 py-1"
              style={{ 
                borderColor: errors.charisma ? 'var(--extra-pop)' : 'var(--secondary-accent)',
                '&:focus': {
                  borderColor: 'var(--main-accent)',
                  outline: 'none',
                  boxShadow: '0 0 0 2px var(--main-accent)'
                }
              }}
            />
            <span id="charisma-range-desc" className="sr-only">
              Valid range is {formatNumber(1)} to {formatNumber(100)}
            </span>
            {errors.charisma && (
              <p 
                id={charismaErrorId}
                className="mt-1 text-xs" 
                style={{ color: 'var(--extra-pop)' }}
                role="alert"
              >
                {errors.charisma}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={vendorPriceInputId} className="block text-sm font-medium mb-1" style={{ color: 'var(--dark-contrast)' }}>
              Vendor Price
              <span className="inline-flex items-center ml-1.5 group relative">
                <FontAwesomeIcon 
                  icon={faCircleInfo}
                  className="h-4 w-4" 
                  style={{ color: 'var(--secondary-accent)' }}
                  aria-hidden="true"
                />
                <span className="sr-only">Valid range information</span>
                <div 
                  className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs rounded shadow-lg whitespace-nowrap z-10"
                  style={{ 
                    backgroundColor: 'var(--dark-contrast)',
                    color: 'var(--light-contrast)'
                  }}
                >
                  Valid range: {formatNumber(1)} - {formatNumber(40000)}
                </div>
              </span>
            </label>
            <input
              id={vendorPriceInputId}
              type="number"
              value={vendorPrice}
              onChange={handleVendorPriceChange}
              aria-invalid={!!errors.vendorPrice}
              aria-describedby={`${errors.vendorPrice ? vendorPriceErrorId : ''} ${vendorPriceDescId} vendor-range-desc`}
              className="w-full rounded-md shadow-sm text-base px-3 py-1"
              style={{ 
                borderColor: errors.vendorPrice ? 'var(--extra-pop)' : 'var(--secondary-accent)',
                '&:focus': {
                  borderColor: 'var(--main-accent)',
                  outline: 'none',
                  boxShadow: '0 0 0 2px var(--main-accent)'
                }
              }}
            />
            <span id="vendor-range-desc" className="sr-only">
              Valid range is {formatNumber(1)} to {formatNumber(40000)}
            </span>
            {errors.vendorPrice && (
              <p 
                id={vendorPriceErrorId}
                className="mt-1 text-xs" 
                style={{ color: 'var(--extra-pop)' }}
                role="alert"
              >
                {errors.vendorPrice}
              </p>
            )}
            {typeof vendorPrice === 'number' && !errors.vendorPrice && (
              <p 
                id={vendorPriceDescId}
                className="mt-1 text-xs text-gray-600"
              >
                Formatted: {formatNumber(Number(vendorPrice))}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Results section */}
      <section 
        aria-labelledby="results-heading"
        className="rounded-b-lg shadow-sm border overflow-hidden"
        style={{ 
          backgroundColor: 'var(--light-contrast)',
          borderColor: 'var(--secondary-accent)'
        }}
        id="price-table"
      >
        <h2 
          id="results-heading" 
          className="text-lg font-semibold p-4 border-b"
          style={{ 
            borderColor: 'var(--secondary-accent)',
            color: 'var(--dark-contrast)'
          }}
        >
          Price Table Results
        </h2>
        
        <div 
          className="max-h-[calc(100vh-24rem)] overflow-y-auto" 
          ref={tableRef}
          role="region" 
          aria-label="Scrollable price table"
        >
          <table 
            className="w-full divide-y"
            style={{ borderColor: 'var(--secondary-accent)' }}
            onKeyDown={handleTableKeyDown}
            role="grid"
            aria-rowcount={priceTable.length}
            aria-label="Price table showing buy prices for different charisma values"
          >
            <caption className="sr-only">
              Price table showing buy prices for different charisma values. 
              Use up and down arrow keys to navigate, Home and End to jump to start or end, 
              PageUp and PageDown to move by 10 rows.
            </caption>
            <thead className="sticky top-0 z-10">
              <tr style={{ backgroundColor: 'var(--light-contrast)' }}>
                <th 
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-sm font-semibold"
                  style={{ color: 'var(--dark-contrast)' }}
                >
                  Charisma
                </th>
                <th 
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-sm font-semibold"
                  style={{ color: 'var(--dark-contrast)' }}
                >
                  Buy Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--secondary-accent)' }}>
              {priceTable.map((entry, index) => (
                <tr 
                  key={entry.charisma}
                  data-charisma={entry.charisma}
                  className={`
                    ${Number(charisma) === entry.charisma 
                      ? "border-y" 
                      : ""
                    }
                    focus:outline-none focus:ring-2 transition-colors
                  `}
                  style={{
                    backgroundColor: Number(charisma) === entry.charisma 
                      ? 'var(--main-accent)' 
                      : 'var(--light-contrast)',
                    borderColor: 'var(--secondary-accent)',
                    '&:hover': { backgroundColor: 'var(--secondary-accent)' },
                    '&:focus': { 
                      ringColor: 'var(--main-accent)',
                    }
                  }}
                  tabIndex={Number(charisma) === entry.charisma ? 0 : -1}
                  role="row"
                  aria-selected={Number(charisma) === entry.charisma}
                  aria-rowindex={index + 1}
                  ref={Number(charisma) === entry.charisma ? highlightedRowRef : null}
                >
                  <td 
                    className="px-3 sm:px-6 py-2 sm:py-3 text-sm"
                    style={{ color: 'var(--dark-contrast)' }}
                    role="gridcell"
                  >
                    {entry.charisma}
                  </td>
                  <td 
                    className="px-3 sm:px-6 py-2 sm:py-3 text-sm"
                    style={{ color: 'var(--dark-contrast)' }}
                    role="gridcell"
                  >
                    {entry.buyPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Back to top link */}
      <a 
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:bottom-4 focus:right-4 focus:z-50 focus:p-2"
        style={{
          backgroundColor: 'var(--light-contrast)',
          borderColor: 'var(--main-accent)',
        }}
      >
        Back to top
      </a>
    </main>
  );
}
