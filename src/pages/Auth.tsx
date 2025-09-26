import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { signInWithEmail, signUpWithEmail, signInWithProvider } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Shield, Sparkles } from 'lucide-react'

// Animated background particles
const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const Auth = () => {
	const [mode, setMode] = useState<'signin'|'signup'>('signin')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		try {
			setLoading(true)
			if (mode === 'signin') await signInWithEmail(email, password)
			else await signUpWithEmail(email, password)
			navigate('/')
		} catch (err: any) {
			setError(err?.message ?? 'Authentication failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center relative overflow-hidden">
			{/* Animated Background */}
			<FloatingParticles />
			
			{/* Main Auth Card */}
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="w-full max-w-md mx-4"
			>
				<Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
					<CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2, duration: 0.5 }}
							className="flex items-center gap-3"
						>
							<motion.div
								className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center"
								whileHover={{ rotate: 360, scale: 1.1 }}
								transition={{ duration: 0.6 }}
							>
								{mode === 'signin' ? (
									<Shield className="h-5 w-5 text-white" />
								) : (
									<Heart className="h-5 w-5 text-white" />
								)}
							</motion.div>
							<div>
								<CardTitle className="font-heading text-xl">
									{mode === 'signin' ? 'Welcome Back' : 'Join SoulSpace'}
								</CardTitle>
								<CardDescription className="font-body text-gray-600">
									{mode === 'signin' ? 'Sign in to continue your journey' : 'Create your account to get started'}
								</CardDescription>
							</div>
						</motion.div>
					</CardHeader>
					
					<CardContent className="p-6">
						<motion.form 
							className="space-y-4"
							onSubmit={handleSubmit}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3, duration: 0.5 }}
						>
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.4, duration: 0.4 }}
							>
								<Label htmlFor="email" className="font-body text-gray-700">Email</Label>
								<Input 
									id="email" 
									type="email" 
									value={email} 
									onChange={(e) => setEmail(e.target.value)} 
									required 
									className="font-body border-gray-300 focus:border-amber-500 focus:ring-amber-500"
									placeholder="Enter your email"
								/>
							</motion.div>
							
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.5, duration: 0.4 }}
							>
								<Label htmlFor="password" className="font-body text-gray-700">Password</Label>
								<Input 
									id="password" 
									type="password" 
									value={password} 
									onChange={(e) => setPassword(e.target.value)} 
									required 
									className="font-body border-gray-300 focus:border-amber-500 focus:ring-amber-500"
									placeholder="Enter your password"
								/>
							</motion.div>
							
							<AnimatePresence>
								{error && (
									<motion.p 
										className="text-red-600 text-sm font-body"
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.3 }}
									>
										{error}
									</motion.p>
								)}
							</AnimatePresence>
							
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6, duration: 0.4 }}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Button 
									type="submit" 
									disabled={loading} 
									className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-body transition-all duration-300"
								>
									{loading ? (
										<motion.div
											className="flex items-center gap-2"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
										>
											<motion.div
												className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
												animate={{ rotate: 360 }}
												transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
											/>
											Please wait…
										</motion.div>
									) : (
										<div className="flex items-center gap-2">
											{mode === 'signin' ? (
												<>
													<Shield className="h-4 w-4" />
													Sign In
												</>
											) : (
												<>
													<Heart className="h-4 w-4" />
													Sign Up
												</>
											)}
										</div>
									)}
								</Button>
							</motion.div>
						</motion.form>
						
						<motion.div 
							className="mt-6 grid gap-2"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7, duration: 0.4 }}
						>
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Button 
									variant="outline" 
									onClick={() => signInWithProvider('google')}
									className="w-full font-body border-gray-300 hover:border-amber-500 hover:bg-amber-50 transition-all duration-300"
								>
									Continue with Google
								</Button>
							</motion.div>
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Button 
									variant="outline" 
									onClick={() => signInWithProvider('apple')}
									className="w-full font-body border-gray-300 hover:border-amber-500 hover:bg-amber-50 transition-all duration-300"
								>
									Continue with Apple
								</Button>
							</motion.div>
						</motion.div>
						
						<motion.div 
							className="text-sm text-center mt-4"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.8, duration: 0.4 }}
						>
							<AnimatePresence mode="wait">
								<motion.button 
									key={mode}
									className="underline text-amber-600 hover:text-amber-700 font-body transition-colors duration-300"
									onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.3 }}
									whileHover={{ scale: 1.05 }}
								>
									{mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
								</motion.button>
							</AnimatePresence>
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	)
}

export default Auth


