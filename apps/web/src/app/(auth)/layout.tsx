import { FloatingIcons } from "@/components/layout/floating-icons"

export default function AuthLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<div className='relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-6 overflow-hidden'>
			<FloatingIcons />
			<div className='relative w-full max-w-md'>
				<div className='mb-8 flex flex-col items-center gap-2'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src='/logo.svg'
						alt='eufaço!'
						width={240}
						height={88}
						className='h-20 w-auto'
						fetchPriority='high'
					/>
				</div>
				{children}
			</div>
		</div>
	)
}
