interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

class PwaState {
  installPrompt: BeforeInstallPromptEvent | null = $state(null)
  installed = $state(false)

  readonly isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS reports as macOS but has touch support
    (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1)

  readonly isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)

  /** Hide install UI when already installed / running as an app. */
  readonly showInstall = $derived(!this.isStandalone && !this.installed)

  /** True when the browser can show its native install prompt right now. */
  readonly canPromptNatively = $derived(this.installPrompt !== null)

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.installPrompt = e as BeforeInstallPromptEvent
    })
    window.addEventListener('appinstalled', () => {
      this.installed = true
      this.installPrompt = null
    })
  }

  async promptInstall() {
    if (!this.installPrompt) return
    const prompt = this.installPrompt
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') this.installPrompt = null
  }
}

export const pwa = new PwaState()
