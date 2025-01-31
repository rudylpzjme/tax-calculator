import { ChakraProvider } from '@chakra-ui/react'
import TaxCalculator from './components/TaxCalculator/TaxCalculator'

function App() {

  return (
    <ChakraProvider>
      <TaxCalculator />
    </ChakraProvider>
  )
}

export default App
