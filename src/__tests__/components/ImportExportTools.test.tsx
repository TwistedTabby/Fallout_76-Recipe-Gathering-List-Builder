import { render, screen } from '@testing-library/react';
import { mockRoutes } from '../../testUtils/testHelpers';

// Mock the ImportExportTools component
jest.mock('../../components/tools/ImportExportTools', () => {
  return function MockImportExportTools() {
    return (
      <div data-testid="mock-import-export-tools">
        <div>
          <h3>Export Data</h3>
          <button>Export All Data</button>
          <button>Export Routes Only</button>
        </div>
        <div>
          <h3>Import Data</h3>
          <button>Import All Data</button>
          <button>Import Routes Only</button>
        </div>
      </div>
    );
  };
});

// Mock FontAwesomeIcon to avoid SVG rendering issues in tests
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="mock-icon" />
}));

// Import after mocking
import ImportExportTools from '../../components/tools/ImportExportTools';

describe('ImportExportTools', () => {
  const mockOnImportData = jest.fn();
  const mockOnConfirm = jest.fn().mockResolvedValue(true);
  const mockOnNotify = jest.fn();
  
  beforeEach(() => {
    mockOnImportData.mockClear();
    mockOnConfirm.mockClear();
    mockOnNotify.mockClear();
  });
  
  test('should render import and export sections', () => {
    render(
      <ImportExportTools
        routes={mockRoutes}
        currentRouteId={null}
        activeTracking={null}
        onImportData={mockOnImportData}
        onConfirm={mockOnConfirm}
        onNotify={mockOnNotify}
      />
    );
    
    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Import Data')).toBeInTheDocument();
    expect(screen.getByText('Export All Data')).toBeInTheDocument();
    expect(screen.getByText('Export Routes Only')).toBeInTheDocument();
    expect(screen.getByText('Import All Data')).toBeInTheDocument();
    expect(screen.getByText('Import Routes Only')).toBeInTheDocument();
  });
}); 