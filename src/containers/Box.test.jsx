import { cleanup, render, screen } from "@testing-library/react"
import Box from "./Box"

afterEach(cleanup)

it('Box displays children', () => {
  render( <Box><span>test text</span></Box>)
  const inner = screen.getByText(/test text/i)
  expect(inner).toBeInTheDocument()
})

// it('Box has className=box', () => {
//   render(<Box />)
// })