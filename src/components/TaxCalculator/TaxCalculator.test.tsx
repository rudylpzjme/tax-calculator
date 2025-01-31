import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import TaxCalculator from './TaxCalculator';
import { api } from '../../../api.config';

jest.mock('../../../api.config', () => ({
  api: {
    get: jest.fn()
  }
}));

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast
  };
});

const mockTaxBrackets = {
  tax_brackets: [
    { min: 0, max: 50000, rate: 0.15 },
    { min: 50000, max: 100000, rate: 0.25 },
    { min: 100000, rate: 0.35 }
  ]
};

const setup = () => {
  return {
    user: userEvent.setup(),
    ...render(
      <ChakraProvider>
        <TaxCalculator />
      </ChakraProvider>
    )
  };
};

describe('TaxCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValue({ data: mockTaxBrackets });
  });

  describe('Form Rendering and Validation', () => {
    it('should render the form with all required fields', () => {
      setup();
      
      expect(screen.getByLabelText(/annual income/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tax year/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /calculate tax/i })).toBeInTheDocument();
    });

    it('should disable submit button when form is empty', () => {
      setup();
      
      const submitButton = screen.getByRole('button', { name: /calculate tax/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show validation error for invalid salary', async () => {
      const { user } = setup();
      
      const salaryInput = screen.getByLabelText(/annual income/i);
      await user.type(salaryInput, '-1000');
      
      expect(await screen.findByText(/salary must be positive/i)).toBeInTheDocument();
    });

    it('should show validation error for salary exceeding maximum', async () => {
      const { user } = setup();
      
      const salaryInput = screen.getByLabelText(/annual income/i);
      await user.type(salaryInput, '20000000');
      
      expect(await screen.findByText(/salary cannot exceed 10M/i)).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should call API with correct tax year', async () => {
      const { user } = setup();
      
      const salaryInput = screen.getByLabelText(/annual income/i);
      await user.type(salaryInput, '75000');
      
      const submitButton = screen.getByRole('button', { name: /calculate tax/i });
      await user.click(submitButton);
      
      expect(api.get).toHaveBeenCalledWith('/tax-calculator/tax-year/2022');
    });

    it('should handle API error gracefully', async () => {
      const { user } = setup();
      const errorMessage = 'API Error';
      (api.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
      
      const salaryInput = screen.getByLabelText(/annual income/i);
      await user.type(salaryInput, '75000');
      
      const submitButton = screen.getByRole('button', { name: /calculate tax/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true
          })
        );
      });
    });
  });

  describe('Tax Calculations', () => {
    it('should calculate taxes correctly and display results', async () => {
      const { user } = setup();
      
      const salaryInput = screen.getByLabelText(/annual income/i);
      await user.type(salaryInput, '75000');
      
      const submitButton = screen.getByRole('button', { name: /calculate tax/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/total tax:/i)).toBeInTheDocument();
        expect(screen.getByText(/effective tax rate:/i)).toBeInTheDocument();
      });

      expect(screen.getByText('$0.00 - $50,000.00')).toBeInTheDocument();
      expect(screen.getByText('$50,000.00 - $100,000.00')).toBeInTheDocument();
    });

    it('should update calculations when input changes and submit button is clicked', async () => {
      const { user } = setup();

      const salaryInput = screen.getByLabelText(/annual income/i);
      await user.type(salaryInput, '50000');
      
      const submitButton = screen.getByRole('button', { name: /calculate tax/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/total tax:/i)).toBeInTheDocument();
      });

      await user.clear(salaryInput);
      await user.type(salaryInput, '100000');
      await user.click(submitButton);
      
      await waitFor(() => {
        const taxAmounts = screen.getAllByRole('cell');
        expect(taxAmounts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Currency and Rate Formatting', () => {
    it('should format tax rates correctly', async () => {
      const { user } = setup();
      
      const salaryInput = screen.getByLabelText(/annual income/i);
      await user.type(salaryInput, '75000');
      
      const submitButton = screen.getByRole('button', { name: /calculate tax/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('15.0%')).toBeInTheDocument();
        expect(screen.getByText('25.0%')).toBeInTheDocument();
      });
    });
  });
});
