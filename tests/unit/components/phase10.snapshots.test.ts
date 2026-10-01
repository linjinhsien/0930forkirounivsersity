import { mount, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ArchitectureSlot from '@/components/board/ArchitectureSlot.vue'
import AzureCardComponent from '@/components/cards/AzureCard.vue'
import GameBoard from '@/components/game/GameBoard.vue'
import ScoreDisplay from '@/components/game/ScoreDisplay.vue'
import { createMockSlots, emptyScore } from '../../fixtures/gameState'
import { allMockCards } from '../../fixtures/cards'
import { mockStartupScenario } from '../../fixtures/scenarios'

const mockLoadCardLibrary = vi.fn().mockResolvedValue([])
const mockInitializeGame = vi.fn().mockResolvedValue(undefined)
const gameStore = {
  gameState: {
    currentScenario: mockStartupScenario,
    hand: allMockCards.slice(0, 4),
    slots: createMockSlots(),
    status: 'complete',
  },
  isGameActive: true,
  validationResult: null,
  isValidating: false,
  currentScenario: mockStartupScenario,
  placedCards: [],
  currentScore: emptyScore,
  initializeGame: mockInitializeGame,
  placeCard: vi.fn(),
  removeCard: vi.fn(),
  submitSolution: vi.fn(),
  setValidationState: vi.fn(),
}

vi.mock('@/stores/game', () => ({
  useGameStore: () => gameStore,
}))

vi.mock('@/stores/codex', () => ({
  useCodexStore: () => ({
    cardLibrary: allMockCards,
    scenarioLibrary: [mockStartupScenario],
    searchResults: [],
    isLoading: false,
    loadCardLibrary: mockLoadCardLibrary,
    filterByDomain: vi.fn(),
    totalCards: allMockCards.length,
  }),
}))

describe('Phase 10 component snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadCardLibrary.mockResolvedValue([])
  })

  it('matches the Azure card snapshot', () => {
    const wrapper = mount(AzureCardComponent, {
      props: { card: allMockCards[0] },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('matches the architecture slot snapshot', () => {
    const wrapper = mount(ArchitectureSlot, {
      props: { architectureSlot: createMockSlots()[0] },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('matches the game board snapshot', () => {
    const wrapper = shallowMount(GameBoard, {
      props: { mode: 'quick-match' },
    })

    expect(wrapper.html()).toMatchSnapshot()
    wrapper.unmount()
  })

  it('matches the score display snapshot', () => {
    const wrapper = mount(ScoreDisplay, {
      props: { score: emptyScore },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
