// app/layout.jsx
export const metadata = {
  title: 'Secret Santa',
  description: 'Family Secret Santa Gift Exchange',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#f0f0f0' }}>
        {children}
      </body>
    </html>
  )
}