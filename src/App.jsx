import { useState } from 'react'
import Chat from './Chat.jsx'

const WA = 'https://wa.me/923273602005?text=Hi%20Asher%2C%20I%27d%20like%20to%20discuss%20a%20project.'
const NAV = [['Services', '#services'], ['Work', '#work'], ['Process', '#process'], ['FAQ', '#faq']]

const SERVICES = [
  { name: 'AI Automation', lead: 'Take repeat work off your team.',
    items: ['Business workflow automation', 'Customer inquiry automation', 'Lead management systems', 'Repetitive task automation', 'Custom AI-powered workflows'] },
  { name: 'Web Development', lead: 'Sites and tools your customers can use.',
    items: ['Business websites', 'Landing pages', 'Interactive websites', 'Client portals', 'Custom web applications'] }
]

const FLOW = [
  ['A customer asks a question', 'Through a website form, chat or WhatsApp.'],
  ['AI reads and sorts it', 'It works out what the message is about and how urgent it is.'],
  ['A task is created', 'The lead is logged and a reply is drafted.'],
  ['You review and follow up', 'You get a notification and stay in control.']
]

const PROCESS = [
  ['Discovery', 'We learn how your business runs and where time is lost.'],
  ['Strategy', 'We agree on scope, tools and what success looks like.'],
  ['Development', 'We build in clear steps and show progress as we go.'],
  ['Delivery', 'We launch, hand over and explain how it all works.']
]

const FAQ = [
  ['What can be automated?', 'Repetitive work such as answering common questions, sorting leads, and moving information between tools. We start by looking at your own workflow.'],
  ['Do I need to be technical?', 'No. We explain each step in plain language and hand over something you can use.'],
  ['How do we start?', 'Send a short description of your project. We reply with questions and a suggested next step.']
]

function Hero() {
  return (
    <section className="mx-auto grid min-h-[88vh] max-w-6xl items-center gap-10 px-5 pb-16 pt-28 md:grid-cols-12 md:px-8">
      <div className="md:col-span-7">
        <p className="mb-6 text-sm text-bone/70">Asher, SmartFlow AI Solution</p>
        <h1 className="font-display text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">Fewer tasks.<br />Faster growth.</h1>
        <p className="mt-8 max-w-md text-lg text-bone/80">We automate the repetitive parts of your business and build the websites that bring customers in.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href="#contact" className="bg-volt px-6 py-3 font-medium text-white hover:bg-white hover:text-ink">Start a project</a>
          <a href="#work" className="border border-bone/40 px-6 py-3 hover:border-bone">See concept work</a>
        </div>
      </div>
      <svg className="md:col-span-5" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <g stroke="#EDE8DD" strokeOpacity=".35" strokeWidth="1.5">
          <path className="thread" d="M10 40 C120 20 120 190 230 200" />
          <path className="thread" d="M10 130 C140 90 100 230 230 200" />
          <path className="thread" d="M10 270 C110 330 150 170 230 200" />
          <path className="thread" d="M10 360 C130 380 120 220 230 200" />
        </g>
        <path className="main-line" d="M230 200 H390" stroke="#3D6BFF" strokeWidth="4" />
        <circle cx="230" cy="200" r="6" fill="#3D6BFF" />
      </svg>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
      <h2 className="max-w-xl font-display text-4xl sm:text-5xl">Two services, one goal: less manual work.</h2>
      <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-20">
        {SERVICES.map((s, i) => (
          <div key={s.name} className={i === 1 ? 'md:mt-20' : ''}>
            <h3 className="font-display text-3xl">{s.name}</h3>
            <p className="mt-2 text-bone/70">{s.lead}</p>
            <ul className="mt-6 border-t border-bone/20">
              {s.items.map((x) => <li key={x} className="border-b border-bone/20 py-3">{x}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function Work() {
  const [i, setI] = useState(0)
  return (
    <section id="work" className="bg-coal py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <h2 className="font-display text-4xl sm:text-5xl">Concept work</h2>
        <p className="mt-3 max-w-lg text-bone/70">A demo project, not a client project. Tap a step to see how an inquiry workflow could run.</p>
        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5" role="tablist" aria-label="Workflow steps">
            {FLOW.map(([t], k) => (
              <button key={t} role="tab" aria-selected={k === i} onClick={() => setI(k)}
                className={`block w-full border-l-2 px-5 py-4 text-left transition-colors ${k === i ? 'border-volt text-bone' : 'border-bone/20 text-bone/50 hover:text-bone'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="md:col-span-7 md:pl-10" aria-live="polite">
            <p className="font-display text-3xl sm:text-4xl">{FLOW[i][0]}</p>
            <p className="mt-4 max-w-md text-lg text-bone/80">{FLOW[i][1]}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section id="process" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
      <h2 className="font-display text-4xl sm:text-5xl">How a project runs</h2>
      <ol className="mt-12 grid gap-0 md:grid-cols-4">
        {PROCESS.map(([t, d], k) => (
          <li key={t} className="border-t border-bone/30 py-6 md:pr-6">
            <span className="font-display text-3xl text-volt">{k + 1}</span>
            <h3 className="mt-3 text-xl font-semibold">{t}</h3>
            <p className="mt-2 text-bone/70">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h2 className="font-display text-4xl sm:text-5xl">Questions</h2>
      <div className="mt-10 border-t border-bone/20">
        {FAQ.map(([q, a]) => (
          <details key={q} className="border-b border-bone/20 py-5">
            <summary className="flex items-center justify-between text-lg">
              {q}<span className="plus text-2xl text-volt transition-transform">+</span>
            </summary>
            <p className="mt-3 max-w-xl text-bone/75">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#" className="font-display text-2xl">Asher</a>
          <nav className="hidden gap-8 md:flex" aria-label="Main">
            {NAV.map(([n, h]) => <a key={n} href={h} className="hover:text-volt">{n}</a>)}
            <a href="#contact" className="text-volt">Contact</a>
          </nav>
          <button className="md:hidden" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-4 px-5 pb-6 md:hidden" aria-label="Mobile">
            {[...NAV, ['Contact', '#contact']].map(([n, h]) => <a key={n} href={h} onClick={() => setOpen(false)} className="text-lg">{n}</a>)}
          </nav>
        )}
      </header>
      <main>
        <Hero /><Services /><Work /><Process /><Faq />
        <section id="contact" className="mx-auto max-w-6xl px-5 py-28 md:px-8">
          <h2 className="max-w-2xl font-display text-5xl sm:text-6xl">Tell us what you want to stop doing by hand.</h2>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="mt-10 inline-block bg-volt px-6 py-3 font-medium text-white hover:bg-white hover:text-ink">Message on WhatsApp</a>
          <p className="mt-4 text-sm text-bone/60">The full project form and private chat arrive in the next phases.</p>
        </section>
      </main>
      <footer className="border-t border-bone/20 px-5 py-8 text-sm text-bone/60 md:px-8">
        <div className="mx-auto max-w-6xl">Asher, SmartFlow AI Solution</div>
      </footer>
      <Chat />
    </>
  )
}
