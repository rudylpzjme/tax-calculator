import React, { useState } from 'react';
import axios from 'axios';
import * as yup from 'yup';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { api } from '../../../api.config';
import { taxCalculatorLogger as logger } from '../../services/logger.service';

interface TaxBracket {
  min: number;
  max?: number;
  rate: number;
}

interface TaxBracketResponse {
  tax_brackets: TaxBracket[];
}

interface TaxCalculation {
  bracket: TaxBracket;
  taxableAmount: number;
  taxPaid: number;
}

interface ValidationErrors {
  salary?: string;
  taxYear?: string;
}

const salarySchema = yup
  .number()
  .positive('Salary must be positive')
  .max(10000000, 'Salary cannot exceed 10M');

const taxYearSchema = yup
  .number()
  .required('Tax year is required')
  .min(2019, 'Tax year must be 2019 or later')
  .max(2022, 'Tax year cannot exceed 2022');

const TAXABLE_YEARS: number[] = [2019, 2020, 2021, 2022];

const TaxCalculator: React.FC = () => {
  const [salary, setSalary] = useState<string>('');
  const [taxYear, setTaxYear] = useState<string>('2022');
  const [loading, setLoading] = useState(false);
  const [calculations, setCalculations] = useState<TaxCalculation[]>([]);
  const [totalTax, setTotalTax] = useState<number>(0);
  const [effectiveRate, setEffectiveRate] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const toast = useToast();

  const validateField = async (field: 'salary' | 'taxYear', value: string) => {
    try {
      if (field === 'salary') {
        await salarySchema.validate(Number(value));
      } else {
        await taxYearSchema.validate(Number(value));
      }
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setValidationErrors(prev => ({ ...prev, [field]: err.message }));
      }
      return false;
    }
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSalary(value);
    validateField('salary', value);
  };

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTaxYear(value);
    validateField('taxYear', value);
  };

  const fetchTaxBrackets = async (year: string): Promise<TaxBracket[]> => {
    logger.info('Fetching tax brackets', { year });
    try {
      const { data } = await api.get<TaxBracketResponse>(
        `/tax-calculator/tax-year/${year}`
      );
      logger.debug('Tax brackets fetched successfully', { 
        year, 
        bracketsCount: data.tax_brackets.length 
      });

      return data.tax_brackets;
    } catch (error) {
      logger.error('Failed to fetch tax brackets', error as Error, { year });
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error);
      }
      throw error;
    }
  };

  const calculateTaxes = (income: number, brackets: TaxBracket[]): TaxCalculation[] => {
    logger.info('Calculating taxes', { income, bracketsCount: brackets.length });
    const calculations: TaxCalculation[] = [];
    let totalTaxPaid = 0;

    const sortedBrackets = [...brackets].sort((a, b) => a.min - b.min);

    sortedBrackets.forEach((bracket) => {
      const min = bracket.min;
      const max = bracket.max ?? Infinity;
      const taxableInBand = Math.max(0, Math.min(income - min, max - min));
      
      if (taxableInBand > 0) {
        const taxPaid = taxableInBand * bracket.rate;
        calculations.push({
          bracket,
          taxableAmount: taxableInBand,
          taxPaid,
        });
        totalTaxPaid += taxPaid;
        logger.debug('Tax calculated for bracket', { 
          min,
          max: max === Infinity ? 'unlimited' : max,
          taxableInBand,
          taxPaid,
          rate: bracket.rate
        });
      }
    });

    const effectiveRateValue = (totalTaxPaid / income) * 100;
    setTotalTax(totalTaxPaid);
    setEffectiveRate(effectiveRateValue);

    logger.info('Tax calculation completed', {
      totalTaxPaid,
      effectiveRate: effectiveRateValue,
      bracketsUsed: calculations.length
    });

    return calculations;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    logger.info('Tax calculation initiated', { salary, taxYear });

    e.preventDefault();
    setCalculations([]);

    const isSalaryValid = await validateField('salary', salary);
    const isTaxYearValid = await validateField('taxYear', taxYear);
    
    if (!isSalaryValid || !isTaxYearValid) {
      logger.warn('Tax calculation aborted due to validation errors', {
        salaryValid: isSalaryValid,
        taxYearValid: isTaxYearValid
      });

      return;
    }
    
    try {
      setLoading(true);
      const brackets = await fetchTaxBrackets(taxYear);
      const results = calculateTaxes(Number(salary), brackets);
      setCalculations(results);
    } catch (err) {
      logger.error('Tax calculation failed', err as Error, { salary, taxYear });

      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatRate = (rate: number): string => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const isSubmitDisabled = Boolean(
    validationErrors.salary || 
    validationErrors.taxYear || 
    !salary || 
    !taxYear
  );

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Income Tax Calculator</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <FormControl isRequired isInvalid={!!validationErrors.salary}>
            <FormLabel>Annual Income (CAD)</FormLabel>
            <Input
              type="number"
              value={salary}
              onChange={handleSalaryChange}
              placeholder="Enter your annual income"
            />
            <FormErrorMessage>
              {validationErrors.salary}
            </FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!validationErrors.taxYear}>
            <FormLabel>Tax Year</FormLabel>
            <Select
              value={taxYear}
              onChange={handleTaxYearChange}
            >
              {TAXABLE_YEARS.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {validationErrors.taxYear}
            </FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={loading}
            isDisabled={isSubmitDisabled}
          >
            Calculate Tax
          </Button>

          {calculations.length > 0 && (
            <Box width="full">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Income Range</Th>
                    <Th isNumeric>Rate</Th>
                    <Th isNumeric>Amount in Bracket</Th>
                    <Th isNumeric>Tax</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {calculations.map((calc, index) => (
                    <Tr key={index}>
                      <Td>
                        {`${formatCurrency(calc.bracket.min)} - ${calc.bracket.max ? formatCurrency(calc.bracket.max) : '∞'}`}
                      </Td>
                      <Td isNumeric>{formatRate(calc.bracket.rate)}</Td>
                      <Td isNumeric>{formatCurrency(calc.taxableAmount)}</Td>
                      <Td isNumeric>{formatCurrency(calc.taxPaid)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <Divider my={4} />

              <VStack align="flex-start" spacing={2}>
                <Text fontWeight="bold">
                  Total Tax: {formatCurrency(totalTax)}
                </Text>
                <Text fontWeight="bold">
                  Effective Tax Rate: {effectiveRate.toFixed(2)}%
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default TaxCalculator;
