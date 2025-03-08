import { createTheme, ThemeProvider } from '@mui/material/styles'

type Props = {
  children?: any
}

export const Theme = ({ children }: Props) => {
  const theme = createTheme({
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  })
  return (
    <>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </>
  )
}
