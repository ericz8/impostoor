<script lang="ts">
  import type { LucideIcon } from '@lucide/svelte'
  import PawPrint from '@lucide/svelte/icons/paw-print'
  import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed'
  import MapPin from '@lucide/svelte/icons/map-pin'
  import Trophy from '@lucide/svelte/icons/trophy'
  import BriefcaseBusiness from '@lucide/svelte/icons/briefcase-business'
  import Clapperboard from '@lucide/svelte/icons/clapperboard'
  import Music from '@lucide/svelte/icons/music'
  import Sofa from '@lucide/svelte/icons/sofa'
  import CloudSun from '@lucide/svelte/icons/cloud-sun'
  import Plane from '@lucide/svelte/icons/plane'
  import Castle from '@lucide/svelte/icons/castle'
  import PartyPopper from '@lucide/svelte/icons/party-popper'
  import Smartphone from '@lucide/svelte/icons/smartphone'
  import PenLine from '@lucide/svelte/icons/pen-line'

  const icons: Record<string, LucideIcon> = {
    animals: PawPrint,
    food: UtensilsCrossed,
    places: MapPin,
    sports: Trophy,
    jobs: BriefcaseBusiness,
    screen: Clapperboard,
    music: Music,
    house: Sofa,
    nature: CloudSun,
    travel: Plane,
    fantasy: Castle,
    celebrations: PartyPopper,
    tech: Smartphone,
    custom: PenLine,
  }

  let { id, size = 16 }: { id: string; size?: number } = $props()

  const Icon = $derived(icons[id] ?? PenLine)
</script>

<Icon {size} strokeWidth={1.75} aria-hidden="true" />
