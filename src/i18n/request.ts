import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

export default getRequestConfig(async () => {
  // Check cookie first, then Accept-Language header, default to 'it'
  const cookieStore = await cookies()
  const headerStore = await headers()
  
  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLanguage = headerStore.get('accept-language')
  
  let locale = 'it' // default
  
  if (cookieLocale && ['it', 'en'].includes(cookieLocale)) {
    locale = cookieLocale
  } else if (acceptLanguage?.startsWith('en')) {
    locale = 'en'
  }
  
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
