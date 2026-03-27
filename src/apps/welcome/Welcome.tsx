const FEATURES = [
  { icon: '\u{1F4C1}', name: 'Files' },
  { icon: '\u{1F4DD}', name: 'Writer' },
  { icon: '\u{1F3A8}', name: 'Draw' },
  { icon: '\u{1F4BB}', name: 'Terminal' },
  { icon: '\u{1F310}', name: 'Browser' },
  { icon: '\u2699\uFE0F', name: 'Settings' },
  { icon: '\u{1F4C5}', name: 'Calendar' },
  { icon: '\u{1F522}', name: 'Calculator' },
] as const;

const TIPS = [
  'Double-click the desktop to create shortcuts',
  'Right-click for context menus',
  'Drag windows to screen edges to snap them',
] as const;

export function Welcome() {
  const handleGetStarted = () => {
    localStorage.setItem('webos-welcome-seen', 'true');
    window.close();
  };

  return (
    <div
      className="flex h-full flex-col items-center justify-center overflow-y-auto px-6 py-10"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Heading */}
      <h1
        className="text-3xl font-bold"
        style={{ color: 'var(--os-text-primary)' }}
      >
        Welcome to WebOS
      </h1>
      <p
        className="mt-2 text-sm"
        style={{ color: 'var(--os-text-muted)' }}
      >
        Your browser-based operating system
      </p>

      {/* Feature Grid */}
      <div className="mt-10 grid grid-cols-4 gap-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.name}
            className="flex flex-col items-center gap-2 rounded-xl border px-4 py-5 transition-colors"
            style={{
              borderColor: 'var(--os-border)',
              backgroundColor: 'var(--os-bg-secondary)',
            }}
          >
            <span className="text-3xl">{feature.icon}</span>
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--os-text-primary)' }}
            >
              {feature.name}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="mt-10 max-w-sm">
        <h2
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--os-text-primary)' }}
        >
          Quick Tips
        </h2>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-xs"
              style={{ color: 'var(--os-text-muted)' }}
            >
              <span style={{ color: 'var(--os-accent)' }}>&bull;</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Get Started Button */}
      <button
        onClick={handleGetStarted}
        className="mt-10 cursor-pointer rounded-lg px-8 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--os-accent)' }}
      >
        Get Started
      </button>
    </div>
  );
}
