import { useState, useRef, useEffect } from 'react';
import { strings } from '../constants/strings';

const charismaTable = [
  { charisma: 1, buyModifier: 2.5, sellModifier: 0.1 },
  { charisma: 2, buyModifier: 2.5, sellModifier: 0.1 },
  { charisma: 3, buyModifier: 2.4, sellModifier: 0.125 },
  { charisma: 4, buyModifier: 2.4, sellModifier: 0.125 },
  { charisma: 5, buyModifier: 2.3, sellModifier: 0.15 },
  { charisma: 6, buyModifier: 2.3, sellModifier: 0.15 },
  { charisma: 7, buyModifier: 2.2, sellModifier: 0.175 },
  { charisma: 8, buyModifier: 2.2, sellModifier: 0.175 },
  { charisma: 9, buyModifier: 2.1, sellModifier: 0.2 },
  { charisma: 10, buyModifier: 2.1, sellModifier: 0.2 },
  { charisma: 11, buyModifier: 1.98, sellModifier: 0.205 },
  { charisma: 12, buyModifier: 1.96, sellModifier: 0.21 },
  { charisma: 13, buyModifier: 1.94, sellModifier: 0.215 },
  { charisma: 14, buyModifier: 1.92, sellModifier: 0.22 },
  { charisma: 15, buyModifier: 1.9, sellModifier: 0.225 },
  { charisma: 16, buyModifier: 1.88, sellModifier: 0.23 },
  { charisma: 17, buyModifier: 1.86, sellModifier: 0.235 },
  { charisma: 18, buyModifier: 1.84, sellModifier: 0.24 },
  { charisma: 19, buyModifier: 1.82, sellModifier: 0.245 },
  { charisma: 20, buyModifier: 1.8, sellModifier: 0.25 },
  { charisma: 21, buyModifier: 1.79, sellModifier: 0.255 },
  { charisma: 22, buyModifier: 1.78, sellModifier: 0.26 },
  { charisma: 23, buyModifier: 1.77, sellModifier: 0.265 },
  { charisma: 24, buyModifier: 1.76, sellModifier: 0.27 },
  { charisma: 25, buyModifier: 1.75, sellModifier: 0.275 },
  { charisma: 26, buyModifier: 1.74, sellModifier: 0.28 },
  { charisma: 27, buyModifier: 1.73, sellModifier: 0.285 },
  { charisma: 28, buyModifier: 1.72, sellModifier: 0.29 },
  { charisma: 29, buyModifier: 1.71, sellModifier: 0.295 },
  { charisma: 30, buyModifier: 1.7, sellModifier: 0.3 },
  { charisma: 31, buyModifier: 1.69, sellModifier: 0.305 },
  { charisma: 32, buyModifier: 1.68, sellModifier: 0.31 },
  { charisma: 33, buyModifier: 1.67, sellModifier: 0.315 },
  { charisma: 34, buyModifier: 1.66, sellModifier: 0.32 },
  { charisma: 35, buyModifier: 1.65, sellModifier: 0.325 },
  { charisma: 36, buyModifier: 1.64, sellModifier: 0.33 },
  { charisma: 37, buyModifier: 1.63, sellModifier: 0.335 },
  { charisma: 38, buyModifier: 1.62, sellModifier: 0.34 },
  { charisma: 39, buyModifier: 1.61, sellModifier: 0.345 },
  { charisma: 40, buyModifier: 1.6, sellModifier: 0.35 },
  { charisma: 41, buyModifier: 1.59, sellModifier: 0.355 },
  { charisma: 42, buyModifier: 1.58, sellModifier: 0.36 },
  { charisma: 43, buyModifier: 1.57, sellModifier: 0.365 },
  { charisma: 44, buyModifier: 1.56, sellModifier: 0.37 },
  { charisma: 45, buyModifier: 1.55, sellModifier: 0.375 },
  { charisma: 46, buyModifier: 1.54, sellModifier: 0.38 },
  { charisma: 47, buyModifier: 1.53, sellModifier: 0.385 },
  { charisma: 48, buyModifier: 1.52, sellModifier: 0.39 },
  { charisma: 49, buyModifier: 1.51, sellModifier: 0.395 },
  { charisma: 50, buyModifier: 1.5, sellModifier: 0.4 },
  { charisma: 51, buyModifier: 1.49, sellModifier: 0.405 },
  { charisma: 52, buyModifier: 1.48, sellModifier: 0.41 },
  { charisma: 53, buyModifier: 1.47, sellModifier: 0.415 },
  { charisma: 54, buyModifier: 1.46, sellModifier: 0.42 },
  { charisma: 55, buyModifier: 1.45, sellModifier: 0.425 },
  { charisma: 56, buyModifier: 1.44, sellModifier: 0.43 },
  { charisma: 57, buyModifier: 1.43, sellModifier: 0.435 },
  { charisma: 58, buyModifier: 1.42, sellModifier: 0.44 },
  { charisma: 59, buyModifier: 1.41, sellModifier: 0.445 },
  { charisma: 60, buyModifier: 1.4, sellModifier: 0.45 },
  { charisma: 61, buyModifier: 1.39, sellModifier: 0.455 },
  { charisma: 62, buyModifier: 1.38, sellModifier: 0.46 },
  { charisma: 63, buyModifier: 1.37, sellModifier: 0.465 },
  { charisma: 64, buyModifier: 1.36, sellModifier: 0.47 },
  { charisma: 65, buyModifier: 1.35, sellModifier: 0.475 },
  { charisma: 66, buyModifier: 1.34, sellModifier: 0.48 },
  { charisma: 67, buyModifier: 1.33, sellModifier: 0.485 },
  { charisma: 68, buyModifier: 1.32, sellModifier: 0.49 },
  { charisma: 69, buyModifier: 1.31, sellModifier: 0.495 },
  { charisma: 70, buyModifier: 1.3, sellModifier: 0.5 },
  { charisma: 71, buyModifier: 1.29, sellModifier: 0.505 },
  { charisma: 72, buyModifier: 1.28, sellModifier: 0.51 },
  { charisma: 73, buyModifier: 1.27, sellModifier: 0.515 },
  { charisma: 74, buyModifier: 1.26, sellModifier: 0.52 },
  { charisma: 75, buyModifier: 1.25, sellModifier: 0.525 },
  { charisma: 76, buyModifier: 1.24, sellModifier: 0.53 },
  { charisma: 77, buyModifier: 1.23, sellModifier: 0.535 },
  { charisma: 78, buyModifier: 1.22, sellModifier: 0.54 },
  { charisma: 79, buyModifier: 1.21, sellModifier: 0.545 },
  { charisma: 80, buyModifier: 1.2, sellModifier: 0.55 },
  { charisma: 81, buyModifier: 1.19, sellModifier: 0.555 },
  { charisma: 82, buyModifier: 1.18, sellModifier: 0.56 },
  { charisma: 83, buyModifier: 1.17, sellModifier: 0.565 },
  { charisma: 84, buyModifier: 1.16, sellModifier: 0.57 },
  { charisma: 85, buyModifier: 1.15, sellModifier: 0.575 },
  { charisma: 86, buyModifier: 1.14, sellModifier: 0.58 },
  { charisma: 87, buyModifier: 1.13, sellModifier: 0.585 },
  { charisma: 88, buyModifier: 1.12, sellModifier: 0.59 },
  { charisma: 89, buyModifier: 1.11, sellModifier: 0.595 },
  { charisma: 90, buyModifier: 1.1, sellModifier: 0.6 },
  { charisma: 91, buyModifier: 1.09, sellModifier: 0.605 },
  { charisma: 92, buyModifier: 1.08, sellModifier: 0.61 },
  { charisma: 93, buyModifier: 1.07, sellModifier: 0.615 },
  { charisma: 94, buyModifier: 1.06, sellModifier: 0.62 },
  { charisma: 95, buyModifier: 1.05, sellModifier: 0.625 },
  { charisma: 96, buyModifier: 1.04, sellModifier: 0.625 },
  { charisma: 97, buyModifier: 1.03, sellModifier: 0.625 },
  { charisma: 98, buyModifier: 1.02, sellModifier: 0.625 },
  { charisma: 99, buyModifier: 1.01, sellModifier: 0.625 },
  { charisma: 100, buyModifier: 1, sellModifier: 0.625 },
];

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
    <main className="container mx-auto px-4 py-8">
      {/* Skip link */}
      <a 
        href="#price-table"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-white focus:border focus:border-indigo-500"
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

      <h1 className="text-3xl font-bold mb-6">{strings.charismaPriceCalc.title}</h1>
      
      {/* Form section */}
      <section aria-labelledby="form-heading">
        <h2 id="form-heading" className="sr-only">Price Calculator Inputs</h2>
        
        <div className="space-y-4">
          <div className="mb-4">
            <label htmlFor={charismaInputId} className="block text-sm font-medium text-gray-900">
              Charisma Stat
            </label>
            <input
              id={charismaInputId}
              type="number"
              value={charisma}
              onChange={handleCharismaChange}
              aria-invalid={!!errors.charisma}
              aria-describedby={errors.charisma ? charismaErrorId : undefined}
              aria-label={`Enter charisma value between ${formatNumber(1)} and ${formatNumber(100)}`}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.charisma && (
              <p 
                id={charismaErrorId}
                className="mt-1 text-sm text-red-700" 
                role="alert"
              >
                {errors.charisma}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor={vendorPriceInputId} className="block text-sm font-medium text-gray-900">
              Vendor Price
            </label>
            <input
              id={vendorPriceInputId}
              type="number"
              value={vendorPrice}
              onChange={handleVendorPriceChange}
              aria-invalid={!!errors.vendorPrice}
              aria-describedby={`${errors.vendorPrice ? vendorPriceErrorId : ''} ${vendorPriceDescId}`}
              aria-label={`Enter vendor price between ${formatNumber(1)} and ${formatNumber(40000)}`}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.vendorPrice && (
              <p 
                id={vendorPriceErrorId}
                className="mt-1 text-sm text-red-700" 
                role="alert"
              >
                {errors.vendorPrice}
              </p>
            )}
            {typeof vendorPrice === 'number' && !errors.vendorPrice && (
              <p 
                id={vendorPriceDescId}
                className="mt-1 text-sm text-gray-700"
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
        className="mb-4"
        id="price-table"
      >
        <h2 id="results-heading" className="sr-only">Price Table Results</h2>
        
        <div 
          className="max-h-96 overflow-y-auto" 
          ref={tableRef}
          role="region" 
          aria-label="Scrollable price table"
        >
          <table 
            className="min-w-full divide-y divide-gray-200"
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
            <thead className="sticky top-0">
              <tr>
                <th 
                  scope="col"
                  className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Charisma
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Buy Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {priceTable.map((entry, index) => (
                <tr 
                  key={entry.charisma}
                  data-charisma={entry.charisma}
                  className={Number(charisma) === entry.charisma ? "bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" : ""}
                  tabIndex={Number(charisma) === entry.charisma ? 0 : -1}
                  role="row"
                  aria-selected={Number(charisma) === entry.charisma}
                  aria-rowindex={index + 1}
                  ref={Number(charisma) === entry.charisma ? highlightedRowRef : null}
                >
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    role="gridcell"
                  >
                    {entry.charisma}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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

      {/* Back to top link - visible when scrolled */}
      <a 
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:bottom-4 focus:right-4 focus:z-50 focus:p-2 focus:bg-white focus:border focus:border-indigo-500"
      >
        Back to top
      </a>
    </main>
  );
}
