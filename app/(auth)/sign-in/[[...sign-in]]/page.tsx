import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <main className='tc-page flex items-center justify-center min-h-[calc(100dvh-var(--tc-nav-height))] w-full px-4 py-10'>
        <SignIn />
    </main>
  )
}
