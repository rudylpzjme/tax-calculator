# Tax Calculator

A React-based tax calculation application built with TypeScript and Vite.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher recommended)

## Installation

```bash
# Clone the repository
git clone [https://github.com/rudylpzjme/tax-calculator]
cd tax-calculator

# Install dependencies
npm install
```

## Development

Start the development server:
```bash
npm run dev
```
This will launch the application in development mode at `http://localhost:5173`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:ci` - Run tests in CI environment

## Tech Stack

### Core
- **Framework:** React 18
- **Build Tool:** Vite 6
- **Language:** TypeScript 5.6

### UI & Forms
- **UI Library:** Chakra UI 2.10
- **Form Handling:** Formik 2.4 + Yup 1.6
- **Animation:** Framer Motion 12.0

### Development Tools
- **HTTP Client:** Axios 1.7
- **Logging:** loglevel 1.9
- **Testing:** Jest 29.7 + Testing Library 16.2

## Project Structure

```
tax-calculator/
├── src/
│   ├── components/
│   │   └── TaxCalculator/
│   ├── services/
│   │   └── logger.service.ts
│   ├── utils/
│   └── App.tsx
├── tests/
├── .eslintrc.js
├── jest.config.js
├── tsconfig.json
└── vite.config.ts
```

## Features

- Tax calculation based on income
- Support for multiple tax years (2019-2022)
- Form validation with Yup
- Error handling and logging
- Responsive design with Chakra UI
- Comprehensive logging system
- Unit testing with Jest and Testing Library

## Testing

The project uses Jest and React Testing Library for testing. Run the test suite:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add some new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Rodolfo López Jaime
Email: rudylpzjmel@gmail.com
Project Link: [https://github.com/rudylpzjme/tax-calculator](https://github.com/rudylpzjme/tax-calculator)

---

## Development Notes

### Environment Variables

The application uses different logging levels based on the environment:
- Development: All logs (debug, info, warn, error)
- Production: Only important logs (warn, error)

### Code Style

- ESLint for code linting
- TypeScript for type safety
- Jest for testing
- Prettier for code formatting (recommended)

### Getting Help

If you have any questions or need help, please:
1. Check the existing issues
2. Create a new issue
3. Contact the maintainers