import { Zap, Paintbrush, Wrench, Scissors, Hammer, Droplets } from "lucide-react"

export function FloatingIcons() {
  return (
    <div className='fixed inset-0 overflow-hidden pointer-events-none z-0'>
      <div className='absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl' />
      <div className='absolute top-1/3 -left-32 h-[300px] w-[300px] rounded-full bg-cyan-400/5 blur-3xl' />
      <div className='absolute -bottom-20 right-1/4 h-[250px] w-[250px] rounded-full bg-primary/3 blur-3xl' />

      <div className='absolute top-[15%] left-[8%] animate-float opacity-[0.07]'>
        <Zap className='h-12 w-12 text-primary' />
      </div>
      <div className='absolute top-[25%] right-[10%] animate-float-slow opacity-[0.07]' style={{ animationDelay: "1s" }}>
        <Paintbrush className='h-10 w-10 text-primary' />
      </div>
      <div className='absolute bottom-[20%] left-[12%] animate-float-reverse opacity-[0.06]' style={{ animationDelay: "2s" }}>
        <Wrench className='h-10 w-10 text-primary' />
      </div>
      <div className='absolute top-[60%] right-[8%] animate-float opacity-[0.06]' style={{ animationDelay: "3s" }}>
        <Scissors className='h-10 w-10 text-primary' />
      </div>
      <div className='absolute bottom-[35%] left-[80%] animate-float-slow opacity-[0.06]' style={{ animationDelay: "0.5s" }}>
        <Hammer className='h-11 w-11 text-primary' />
      </div>
      <div className='absolute top-[45%] left-[5%] animate-float-reverse opacity-[0.05]' style={{ animationDelay: "1.5s" }}>
        <Droplets className='h-9 w-9 text-primary' />
      </div>
    </div>
  )
}
